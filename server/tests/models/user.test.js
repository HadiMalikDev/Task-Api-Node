const knex = require("../../database/connection");
const {
  USER_TABLE_NAME,
  TASK_TABLE_NAME,
} = require("../../models/helpers/consts");
const Task = require("../../models/task");
const User = require("../../models/user");

const INVALID_EMAIL = "Invalid email specified";
const DUPLICATE_EMAIL = "Duplicate email detected";
const INVALID_NAME = "Invalid name specified";
const INVALID_PWD = "Invalid password specified";
const EMPTY_FIELD =
  "One or more of the required fields have not been specified";
const USER_NOT_FOUND = "User with specified email does not exist";
const OPERATION_FAILED = "Could not complete operation";

beforeAll(async () => {
  await knex(TASK_TABLE_NAME).del();
  if (await knex.schema.hasTable(USER_TABLE_NAME))
    await knex(USER_TABLE_NAME).del();
});
describe("Test User Model", () => {
  describe("Test Create User function", () => {
    test("Create entry if correct fields specified with unique email", async () => {
      await User.createUser("Hadi", "xars121@gmail.com", "Hadi!");
      const user = await User.getUser("xars121@gmail.com");
      expect(user).not.toBeNull();
    });
    test("Throw error if correct fields specified with non-unique email", async () => {
      expect.assertions(1);
      const res = User.createUser("Hadi", "xars121@gmail.com", "Hadi!");
      return res.catch((e) => {
        expect(e.message).toEqual(DUPLICATE_EMAIL);
      });
    });
    test("Throw error if incorrect fields specified with unique email", async () => {
      //Sending an incorrect name
      expect.assertions(4);
      try {
        const res = await User.createUser(
          "Hadi121",
          "un@gmail.com",
          "hadi1234"
        );
      } catch (error) {
        expect(error.message).toEqual(INVALID_NAME);
      }
      //Sending incorrect email
      try {
        const res = await User.createUser("Hadi", "un@gmail", "hadi1234");
      } catch (error) {
        expect(error.message).toEqual(INVALID_EMAIL);
      }
      //Sending incorrect password(length less than 4)
      try {
        const res = await User.createUser("Hadi", "xxx@gmail.com", "123");
      } catch (error) {
        expect(error.message).toEqual(INVALID_PWD);
      }
      //Sending incorrect password(number passed instead of string)
      try {
        const res = await User.createUser("Hadi", "xxx@gmail.com", 123);
      } catch (error) {
        expect(error.message).toEqual(INVALID_PWD);
      }
    });
    test("Throw error if empty string passed as any/all field", async () => {
      expect.assertions(4);
      try {
        await User.createUser("", "hadi@gmail.com", "hadi121");
      } catch (error) {
        expect(error.message).toEqual(EMPTY_FIELD);
      }
      try {
        await User.createUser("Hadi", "", "hadi121");
      } catch (error) {
        expect(error.message).toEqual(EMPTY_FIELD);
      }
      try {
        await User.createUser("Hadi", "hadi@gmail.com", "");
      } catch (error) {
        expect(error.message).toEqual(EMPTY_FIELD);
      }
      try {
        await User.createUser("", "", "");
      } catch (error) {
        expect(error.message).toEqual(EMPTY_FIELD);
      }
    });
    test("Throw error if nothing passed as any/all field", async () => {
      expect.assertions(4);
      try {
        await User.createUser(undefined, "hadi@gmail.com", "hadi121");
      } catch (error) {
        expect(error.message).toEqual(EMPTY_FIELD);
      }
      try {
        await User.createUser("Hadi", undefined, "hadi121");
      } catch (error) {
        expect(error.message).toEqual(EMPTY_FIELD);
      }
      try {
        await User.createUser("Hadi", "hadi@gmail.com", undefined);
      } catch (error) {
        expect(error.message).toEqual(EMPTY_FIELD);
      }
      try {
        await User.createUser(undefined, undefined, undefined);
      } catch (error) {
        expect(error.message).toEqual(EMPTY_FIELD);
      }
    });
  });
  describe("Test Get User function", () => {
    test("Get correct user if user email exists", async () => {
      await User.createUser("Hadi", "www@gmail.com", "Hadi121");
      const res = await User.getUser("www@gmail.com");
      expect(res).not.toBeNull();
      expect(res).toMatchObject({
        name: "Hadi",
        email: "www@gmail.com",
        password: "Hadi121",
      });
    });
    test("Throw error if user with email does not exist", async () => {
      expect.assertions(1);
      try {
        await User.getUser("hehe@gmail.com");
      } catch (error) {
        expect(error.message).toEqual(USER_NOT_FOUND);
      }
    });
    describe("Throw error if no/incorrect email specified", () => {
      test("No email specified", async () => {
        expect.assertions(1);
        try {
          await User.getUser();
        } catch (error) {
          expect(error.message).toEqual(INVALID_EMAIL);
        }
      });
      test("Invalid email format given", async () => {
        expect.assertions(1);
        try {
          await User.getUser(121);
        } catch (error) {
          expect(error.message).toEqual(INVALID_EMAIL);
        }
      });
      test("Non-existing email given", async () => {
        expect.assertions(1);
        try {
          await User.getUser("s");
        } catch (error) {
          expect(error.message).toEqual(INVALID_EMAIL);
        }
      });
    });
  });
  describe("Test Update User function", () => {
    describe("Correct updation if correct inputs specified", () => {
      beforeAll(async () => {
        await User.createUser("Hadi", "new@gmail.com", "Hadi1234");
      });

      test("Correct updation if correct name", async () => {
        //Check updated name
        await User.updateUser("new@gmail.com", { name: "Hadiii" });
        const updated = await User.getUser("new@gmail.com");
        expect(updated).toMatchObject({
          name: "Hadiii",
          email: "new@gmail.com",
          password: "Hadi1234",
        });
      });
      test("Correct updation if correct password", async () => {
        //Check updated passsword
        await User.updateUser("new@gmail.com", {
          password: "newpwd",
        });
        const pwdupdated = await User.getUser("new@gmail.com");
        expect(pwdupdated).toMatchObject({
          name: "Hadiii",
          email: "new@gmail.com",
          password: "newpwd",
        });
      });
      test("Correct updation if both name and password specified", async () => {
        await User.updateUser("new@gmail.com", {
          name: "Hadu",
          password: "Hadi4321",
        });
        const user = await User.getUser("new@gmail.com");
        expect(user).toMatchObject({
          name: "Hadu",
          email: "new@gmail.com",
          password: "Hadi4321",
        });
      });
    });
    describe("Errors if wrong inputs specified", () => {
      test("Specified email does not exist", async () => {
        expect.assertions(1);
        try {
          await User.updateUser("idonotexist@gmail.com", {
            name: "hehe",
            password: "valid!",
          });
        } catch (error) {
          expect(error.message).toBe(USER_NOT_FOUND);
        }
      });
      describe("Missing fields", () => {
        test("Email not specified", async () => {
          expect.assertions(1);
          try {
            await User.updateUser("", {
              name: "NAAAAAAAAAA",
              password: "adssssss",
            });
          } catch (error) {
            expect(error.message).toBe(EMPTY_FIELD);
          }
        });
        test("No updation object specified", async () => {
          expect.assertions(1);
          try {
            await User.updateUser("x@gmail.com", {});
          } catch (error) {
            expect(error.message).toBe(EMPTY_FIELD);
          }
        });
        test("Nothing specified", async () => {
          expect.assertions(1);
          try {
            await User.updateUser();
          } catch (error) {
            expect(error.message).toBe(EMPTY_FIELD);
          }
        });
      });
    });
  });
  describe("Test Delete User function", () => {
    beforeAll(async () => {
      await knex(USER_TABLE_NAME).del();
      await knex(TASK_TABLE_NAME).del();
    });
    test("Delete user with no tasks if user exists", async () => {
      await User.createUser("Temp", "temp@gmail.com", "Hadi1234");
      await User.deleteUser("temp@gmail.com");
      expect.assertions(1);
      try {
        await User.getUser("temp@gmail.com");
      } catch (error) {
        expect(error.message).toBe(USER_NOT_FOUND);
      }
    });
    test("Delete user with tasks and delete tasks too", async () => {
      await User.createUser("Temp", "temp@gmail.com", "Hadi1234");
      await Task.createTask("sss", "ssssss", "temp@gmail.com");
      await Task.createTask("sss2", "2222", "temp@gmail.com");
      const tasks = await Task.getTasks("temp@gmail.com");
      expect(tasks.length).toBe(2);
      await User.deleteUser("temp@gmail.com");
      const new1 = await Task.getTasks("temp@gmail.com");
      expect(new1.length).toBe(0);
    });
    describe("Throw error if incorrect parameters", () => {
      test("Throw error if email format incorrect", async () => {
        expect.assertions(1);
        try {
          await User.deleteUser(234);
        } catch (error) {
          expect(error.message).toBe(INVALID_EMAIL);
        }
      });
      test("Throw error if user with email does not exist", async () => {
        expect.assertions(1);
        try {
          await User.deleteUser("temp222@gmail.com");
        } catch (error) {
          expect(error.message).toBe(USER_NOT_FOUND);
        }
      });
    });
  });
});
