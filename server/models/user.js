const knex = require("../database/connection");
const validator = require("validator");
const {
  tableExists,
  isValidEmail,
  INVALID_EMAIL,
  USER_TABLE_NAME,
  EMPTY_FIELD,
  USER_NOT_FOUND,
  OPERATION_FAILED,
  INVALID_UPDATE_EMAIL,
} = require("./helpers/consts");

const TABLE_NAME = USER_TABLE_NAME;

const DUPLICATE_EMAIL = "Duplicate email detected";
const INVALID_NAME = "Invalid name specified";
const INVALID_PWD = "Invalid password specified";

const User = {
  async createUser(name, email, password) {
    if (!name || !email || !password) {
      throw Error(EMPTY_FIELD);
    }
    if (!isValidEmail(email)) {
      throw Error(INVALID_EMAIL);
    }
    if (!isValidName(name)) {
      throw Error(INVALID_NAME);
    }
    if (!isValidPassword(password)) {
      throw Error(INVALID_PWD);
    }
    if (!(await tableExists(TABLE_NAME))) {
      await createUserTable();
    }
    email = email.toLowerCase();
    var res;
    try {
      res = await knex(TABLE_NAME).insert({ name, email, password });
    } catch (error) {
      if (error.errno == 1062) {
        throw Error(DUPLICATE_EMAIL);
      }
      throw Error(OPERATION_FAILED);
    }
    if (!res.length != 0 || !res[0] != 1) {
      throw Error(OPERATION_FAILED);
    }
  },
  async getUser(email) {
    if (!isValidEmail(email)) throw Error(INVALID_EMAIL);

    var res;
    try {
      if (!(await tableExists(TABLE_NAME))) {
        await createUserTable();
      }
      res = await knex(TABLE_NAME).where("email", email.toLowerCase());
    } catch (error) {
      throw Error(OPERATION_FAILED);
    }
    if (res.length === 0) throw Error(USER_NOT_FOUND);
    return res[0];
  },
  async updateUser(email, updateObject) {
    if (!email && !isValidEmail(email)) throw Error(INVALID_EMAIL);
    const { name, password } = updateObject;
    if (!name && !password) throw Error(EMPTY_FIELD);
    if (name && !isValidName(name)) throw Error(INVALID_NAME);
    if (password && !isValidPassword(password)) throw Error(INVALID_PWD);
    if (updateObject.email) throw Error(INVALID_UPDATE_EMAIL);

    let res;
    try {
      res = await knex(TABLE_NAME)
        .where("email", email.toLowerCase())
        .update(updateObject);
    } catch (error) {
      throw Error(OPERATION_FAILED);
    }
    if (res != 1) throw Error(USER_NOT_FOUND);
  },
  async deleteUser(email) {
    if (!isValidEmail(email)) throw Error(INVALID_EMAIL);
    let res;
    try {
      res = await knex(TABLE_NAME).where("email", email).del();
    } catch (error) {
      throw Error(OPERATION_FAILED);
    }
    if (res === 0) throw Error(USER_NOT_FOUND);
  },
};

const isValidName = (name) =>
  typeof name === "string" && validator.default.isAlpha(name);
const isValidPassword = (pwd) => typeof pwd === "string" && pwd.length >= 4;

const createUserTable = async () => {
  await knex.schema.createTable(TABLE_NAME, function (table) {
    table.string("email").notNullable();
    table.unique("email");
    table.primary("email");
    table.string("name").checkLength(">", 0);
    table.string("password").checkLength(">", 4);
  });
};
module.exports = User;