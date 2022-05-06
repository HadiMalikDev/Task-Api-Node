const knex = require("../database/connection");
const validator = require("validator");

const TABLE_NAME = "users";

const User = {
  async createUser(name, email, password) {
    if (!name || !email || !password) {
      throw Error("Incomplete values. Please specify all required values");
    }
    if (!validator.default.isEmail(email)) {
      throw Error("Please specify a valid email");
    }
    if (!validator.default.isAlpha(name)) {
      throw Error("Name should contain only alphabets");
    }
    if (!(typeof password === "string") || password.length < 4) {
      throw Error("Password should be a string of length at least 4");
    }
    if (!(await tableExists())) {
      await createUserTable();
    }
    email = email.toLowerCase();
    try {
      const res = await knex(TABLE_NAME).insert({ name, email, password });
      if (!res.length != 0 || !res[0] != 1) {
        throw Error("Could not insert query into database");
      }
    } catch (error) {
      if (error.errno == 1062) {
        throw Error(`There is already a user with the email ${email}`);
      }
      throw Error("Failed to complete operation", error);
    }
  },
  async getUser(email) {
    if (!email || typeof email != "string" || !validator.default.isEmail(email))
      throw Error("Please specify a valid email");

    var res;
    try {
      if (!(await tableExists())) {
        await createUserTable();
      }
      res = await knex(TABLE_NAME).where("email", email.toLowerCase());
    } catch (error) {
      throw Error("Failed to complete operation", error);
    }
    if (res.length === 0) throw Error("No such user exists");
    return res[0];
  },
  
};

//Checks if given table exists
const tableExists = async () => {
  const exists = await knex.schema.hasTable(TABLE_NAME);
  return exists;
};
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
