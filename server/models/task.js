const knex = require("../database/connection");
const validator = require("validator");
const {
  tableExists,
  isValidEmail,
  INVALID_EMAIL,
  TASK_TABLE_NAME,
  EMPTY_FIELD,
  OPERATION_FAILED,
  USER_NOT_FOUND,
  INVALID_UPDATE_EMAIL,
  INVALID_TITLE,
  INVALID_DESCRIPTION,
  INVALID_COMPLETED,
  INVALID_ID,
  TASK_NOT_FOUND,
  EXTRA_PARAMETERS,
} = require("./helpers/consts");

const TABLE_NAME = TASK_TABLE_NAME;

const Task = {
  async createTask(title, description, owner) {
    if (!title || !description || !owner) throw Error(EMPTY_FIELD);
    if (!validTitle(title)) throw Error(INVALID_TITLE);
    if (!validDescription(description)) throw Error(INVALID_DESCRIPTION);
    if (!isValidEmail(owner)) throw Error(INVALID_EMAIL);
    try {
      if (!(await tableExists(TABLE_NAME))) {
        await createTasksTable();
      }
    } catch (error) {
      throw Error(OPERATION_FAILED);
    }
    var res;
    try {
      res = await knex(TABLE_NAME).insert({ title, description, owner });
    } catch (error) {
      if (error.errno == 1452) {
        throw Error(USER_NOT_FOUND);
      }
      console.log(error);
      throw Error(OPERATION_FAILED);
    }
  },
  async getTasks(owner) {
    if (!owner) throw Error(EMPTY_FIELD);
    if (!isValidEmail(owner)) throw Error(INVALID_EMAIL);

    var res;
    try {
      if (!(await tableExists(TABLE_NAME))) {
        await createTasksTable();
      }
      res = await knex(TABLE_NAME).where("owner", owner.toLowerCase());
      return res;
    } catch (error) {
      console.log(error);
      throw Error(OPERATION_FAILED);
    }
  },
  async getTask(taskId) {
    if (!taskId || typeof taskId != "number") throw Error(INVALID_ID);
    var res;
    try {
      if (!(await tableExists(TABLE_NAME))) {
        await createTasksTable();
      }
      res = await knex(TABLE_NAME).where("taskId", taskId);
    } catch (error) {
      throw Error(OPERATION_FAILED);
    }
    if (!res || !res.length) throw Error(TASK_NOT_FOUND);
    return res[0];
  },
  async updateTask(task_id, updateObject) {
    const allowedUpdates = ["title", "description", "completed"];
    if (!task_id || !updateObject) throw Error(EMPTY_FIELD);
    if (typeof task_id != "number") throw Error(INVALID_ID);

    const updateObjectKeys = Object.keys(updateObject);
    if (!updateObjectKeys.length) throw Error(EMPTY_FIELD);
    const containsExtraField = updateObjectKeys.some(
      (key) => !allowedUpdates.includes(key)
    );
    if (containsExtraField) throw Error(EXTRA_PARAMETERS);

    if (updateObject.title && !validTitle(updateObject.title))
      throw Error(INVALID_TITLE);
    if (updateObject.description && !validDescription(updateObject.description))
      throw Error(INVALID_DESCRIPTION);
    if (updateObject.completed && !validCompleted(updateObject.completed))
      throw Error(INVALID_COMPLETED);

    let res;
    try {
      res = await knex(TABLE_NAME)
        .where("taskId", task_id)
        .update(updateObject);
    } catch (error) {
      throw Error(OPERATION_FAILED);
    }
    if (res != 1) throw Error(TASK_NOT_FOUND);
  },
  async deleteTask(taskId) {
    if (!taskId || typeof taskId != "number") throw Error(INVALID_ID);
    let res;
    try {
      res = await knex(TABLE_NAME).where("taskId", taskId).del();
    } catch (error) {
      throw Error(OPERATION_FAILED);
    }
    if (res === 0) throw Error(TASK_NOT_FOUND);
  },
  async hasOwner(taskId, owner) {
    if (!taskId || typeof taskId != "number") throw Error(INVALID_ID);
    if (!isValidEmail(owner)) throw Error(INVALID_EMAIL);
    try {
      const res = await knex(TABLE_NAME)
        .where("taskId", "=", taskId)
        .andWhere("owner", "=", owner);
      if (res.length === 1) return true;
      return false;
    } catch (error) {
      throw Error(OPERATION_FAILED);
    }
  },
};

const createTasksTable = async () => {
  await knex.schema.createTable(TABLE_NAME, function (table) {
    table.increments("taskId");
    table.string("title").notNullable();
    table.string("description").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.boolean("completed").defaultTo(false);
    table.string("owner");
    table.foreign("owner").references("users.email").onDelete("CASCADE");
  });
};

const validTitle = (title) => typeof title === "string";
const validDescription = (description) => typeof description === "string";
const validCompleted = (completed) => typeof completed === "boolean";

module.exports = Task;
