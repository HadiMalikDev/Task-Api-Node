const knex = require("../../database/connection");
const validator = require("validator");
//Checks if given table exists
const tableExists = async (name) => {
  const exists = await knex.schema.hasTable(name);
  return exists;
};
const isValidEmail = (email) =>
  typeof email === "string" && validator.default.isEmail(email);
const INVALID_EMAIL = "Invalid email specified";
const USER_TABLE_NAME = "users";
const TASK_TABLE_NAME = "tasks";
const EMPTY_FIELD =
  "One or more of the required fields have not been specified";
const USER_NOT_FOUND = "User with specified email does not exist";
const TASK_NOT_FOUND = "Task with specified id does not exist";
const OPERATION_FAILED = "Could not complete operation";
const INVALID_UPDATE_EMAIL = "Cannot update email";
const INVALID_TITLE = "Invalid title specified";
const INVALID_DESCRIPTION = "Invalid description specified";
const INVALID_COMPLETED = "Invalid completed specified";
const INVALID_ID = "Invalid id specified";
const EXTRA_PARAMETERS = "Extra parameters in update object";

const DUPLICATE_EMAIL = "Duplicate email detected";
const INVALID_NAME = "Invalid name specified";
const INVALID_PWD = "Invalid password specified";

module.exports = {
  tableExists,
  isValidEmail,
  INVALID_EMAIL,
  INVALID_UPDATE_EMAIL,
  INVALID_TITLE,
  INVALID_DESCRIPTION,
  INVALID_COMPLETED,
  INVALID_ID,
  USER_TABLE_NAME,
  TASK_TABLE_NAME,
  EMPTY_FIELD,
  USER_NOT_FOUND,
  TASK_NOT_FOUND,
  OPERATION_FAILED,
  EXTRA_PARAMETERS,
  DUPLICATE_EMAIL,
  INVALID_NAME,
  INVALID_PWD,
};
