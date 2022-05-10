const Task = require("../../models/task");

const taskResolvers = {
  Query: {
    tasks: async (parent, { email }) => {
      console.log(email);
      return await Task.getTasks(email);
    },
    task: async (parent, { id }) => {
      return await Task.getTask(id);
    },
  },
  Task: {},
  Mutation: {
    createTask: async (parent, item) => {
      const token=item.token;
      const { title, description, owner } = item.newTask;
      return await Task.createTask(title, description, owner);
    },
    updateTask: async (parent, item) => {
      const id = item.id;
      const updateObject = item.updateFields;
      return await Task.updateTask(id, updateObject);
    },
    deleteTask: async (parent, { id }) => {
      return await Task.deleteTask(id);
    },
  },
};

module.exports = taskResolvers;
