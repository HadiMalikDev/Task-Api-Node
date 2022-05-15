const { verifyToken } = require("../../auth/auth");
const { INVALID_OPERATION } = require("../../auth/consts");
const Task = require("../../models/task");

const taskResolvers = {
  Query: {
    tasks: async (parent, { token }) => {
      try {
        const owner = await verifyToken(token);
        const tasks = await Task.getTasks(owner.email);
        return { __typename: "Tasks", tasks };
      } catch (error) {
        return { __typename: "OperationFailed", message: error.message };
      }
    },
    task: async (parent, { id, token }) => {
      try {
        const owner = await verifyToken(token);
        if (await Task.hasOwner(id, owner.email)) {
          const task = await Task.getTask(id);
          console.log(task)
          const res={ __typename: "Task",...task };
          console.log(res)
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
        const owner = await verifyToken(token);
        const { title, description } = item.newTask;
        await Task.createTask(title, description, owner.email);
        return { __typename: "mutationResult", success: true };
      } catch (error) {
        return { __typename: "OperationFailed", message: error.message };
      }
    },
    updateTask: async (parent, item) => {
      try {
        const token = item.token;
        const owner = await verifyToken(token);
        const id = item.id;
        if (await Task.hasOwner(id, owner.email)) {
          const updateObject = item.updateFields;
          await Task.updateTask(id, updateObject);
          return { __typename: "mutationResult", success: true };
        }
        throw Error(INVALID_OPERATION);
      } catch (error) {
        console.log(error)
        return { __typename: "OperationFailed", message: error.message };
      }
    },
    deleteTask: async (parent, { id, token }) => {
      try {
        const owner = await verifyToken(token);
        if (await Task.hasOwner(id, owner.email)) {
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

module.exports = taskResolvers;
