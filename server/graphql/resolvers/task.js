const { verifyToken } = require("../../auth/auth");
const { INVALID_OPERATION } = require("../../auth/consts");
const Task = require("../../models/task");

const taskResolvers = {
  Query: {
    tasks: async (parent, { token }) => {
      const owner = await verifyToken(token);
      return await Task.getTasks(owner);
    },
    task: async (parent, { id, token }) => {
      const owner = await verifyToken(token);
      if (await Task.hasOwner(id, owner)) {
        return await Task.getTask(id);
      }
      throw Error(INVALID_OPERATION);
    },
  },
  Task: {},
  Mutation: {
    createTask: async (parent, item) => {
      const token = item.token;
      const owner = await verifyToken(token);
      const { title, description } = item.newTask;
      return await Task.createTask(title, description, owner);
    },
    updateTask: async (parent, item) => {
      const token = item.token;
      const owner = await verifyToken(token);
      const id = item.id;
      if (await Task.hasOwner(id, owner)) {
        const updateObject = item.updateFields;
        return await Task.updateTask(id, updateObject);
      } else throw Error(INVALID_OPERATION);
    },
    deleteTask: async (parent, { id, token }) => {
      const owner = await verifyToken(token);
      if (await Task.hasOwner(id, owner)) {
        return await Task.deleteTask(id);
      } else throw Error(INVALID_OPERATION);
    },
  },
};

module.exports = taskResolvers;
