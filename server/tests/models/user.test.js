const knex = require("../../database/connection");
const User = require("../../models/user");

beforeAll(async () => {
  if (await knex.schema.hasTable("users")) await knex("users").del();
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
        expect(e.message).toEqual(
          "There is already a user with the email xars121@gmail.com"
        );
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
        expect(error.message).toEqual("Name should contain only alphabets");
      }
      //Sending incorrect email
      try {
        const res = await User.createUser("Hadi", "un@gmail", "hadi1234");
      } catch (error) {
        expect(error.message).toEqual("Please specify a valid email");
      }
      //Sending incorrect password(length less than 4)
      try {
        const res = await User.createUser("Hadi", "xxx@gmail.com", "123");
      } catch (error) {
        expect(error.message).toEqual(
          "Password should be a string of length at least 4"
        );
      }
      //Sending incorrect password(number passed instead of string)
      try {
        const res = await User.createUser("Hadi", "xxx@gmail.com", 123);
      } catch (error) {
        expect(error.message).toEqual(
          "Password should be a string of length at least 4"
        );
      }
    });
    test("Throw error if empty string passed as any/all field", async () => {
      expect.assertions(4);
      try {
        await User.createUser("", "hadi@gmail.com", "hadi121");
      } catch (error) {
        expect(error.message).toEqual(
          "Incomplete values. Please specify all required values"
        );
      }
      try {
        await User.createUser("Hadi", "", "hadi121");
      } catch (error) {
        expect(error.message).toEqual(
          "Incomplete values. Please specify all required values"
        );
      }
      try {
        await User.createUser("Hadi", "hadi@gmail.com", "");
      } catch (error) {
        expect(error.message).toEqual(
          "Incomplete values. Please specify all required values"
        );
      }
      try {
        await User.createUser("", "", "");
      } catch (error) {
        expect(error.message).toEqual(
          "Incomplete values. Please specify all required values"
        );
      }
    });
    test("Throw error if nothing passed as any/all field", async () => {
      expect.assertions(4);
      try {
        await User.createUser(undefined, "hadi@gmail.com", "hadi121");
      } catch (error) {
        expect(error.message).toEqual(
          "Incomplete values. Please specify all required values"
        );
      }
      try {
        await User.createUser("Hadi", undefined, "hadi121");
      } catch (error) {
        expect(error.message).toEqual(
          "Incomplete values. Please specify all required values"
        );
      }
      try {
        await User.createUser("Hadi", "hadi@gmail.com", undefined);
      } catch (error) {
        expect(error.message).toEqual(
          "Incomplete values. Please specify all required values"
        );
      }
      try {
        await User.createUser(undefined, undefined, undefined);
      } catch (error) {
        expect(error.message).toEqual(
          "Incomplete values. Please specify all required values"
        );
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
        expect(error.message).toEqual("No such user exists");
      }
    });
    test("Throw error if no/incorrect email specified", async () => {
      expect.assertions(3);
      try {
        await User.getUser();
      } catch (error) {
        expect(error.message).toEqual("Please specify a valid email")
      }
      try {
        await User.getUser(121);
      } catch (error) {
        expect(error.message).toEqual("Please specify a valid email")
      }
      try {
        await User.getUser("s");
      } catch (error) {
        expect(error.message).toEqual("Please specify a valid email")
      }
    });
  });
});
