const { verifyToken } = require("../../auth/auth");
const { INVALID_OPERATION } = require("../../auth/consts");
const { getEmail, setEmailForToken } = require("../../cache/redis");
const Task = require("../../models/task");

const taskResolvers = {
  Query: {
    tasks: async (parent, { token }) => {
      try {
        const email = await getTokenEmail(token);
        const tasks = await Task.getTasks(email);
        return { __typename: "Tasks", tasks };
      } catch (error) {
        return { __typename: "OperationFailed", message: error.message };
      }
    },
    task: async (parent, { id, token }) => {
      try {
        const email = await getTokenEmail(token);
        if (await Task.hasOwner(id, email)) {
          const task = await Task.getTask(id);
          const res = { __typename: "Task", ...task };
          return res;
        }
        throw Error(INVALID_OPERATION);
      } catch (error) {
        return { __typename: "OperationFailed", message: error.message };
      }
    },
  },
  Task: {},
  Mutation: {
    createTask: async (parent, item) => {
      try {
        const token = item.token;
        const email = await getTokenEmail(token);
        const { title, description } = item.newTask;
        await Task.createTask(title, description, email);
        return { __typename: "mutationResult", success: true };
      } catch (error) {
        return { __typename: "OperationFailed", message: error.message };
      }
    },
    updateTask: async (parent, item) => {
      try {
        const token = item.token;
        const email = await getTokenEmail(token);
        const id = item.id;
        if (await Task.hasOwner(id, email)) {
          const updateObject = item.updateFields;
          await Task.updateTask(id, updateObject);
          return { __typename: "mutationResult", success: true };
        }
        throw Error(INVALID_OPERATION);
      } catch (error) {
        console.log(error);
        return { __typename: "OperationFailed", message: error.message };
      }
    },
    deleteTask: async (parent, { id, token }) => {
      try {
        const email = await getTokenEmail(token);
        if (await Task.hasOwner(id, email)) {
          await Task.deleteTask(id);
          return { __typename: "mutationResult", success: true };
        }
        throw Error(INVALID_OPERATION);
      } catch (error) {
        return { __typename: "OperationFailed", message: error.message };
      }
    },
  },
};

//Checks whether the token is in the redis cache. If not, then it queries the main db and updates cache
//Utilizing cache resulted in 3x improvement 0-0
const getTokenEmail = async (token) => {
  let email = await getEmail(token);
  if (!email) {
    const owner = await verifyToken(token);
    email = owner.email;
    try {
      await setEmailForToken(token, email);
    } catch (error) {}
  }
  return email;
};

module.exports = taskResolvers;
