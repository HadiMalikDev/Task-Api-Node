const server = require("../../server");
const supertest = require("supertest");
const knex = require("../../database/connection");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {
  USER_TABLE_NAME,
  DUPLICATE_EMAIL,
  INVALID_NAME,
  INVALID_EMAIL,
  INVALID_PWD,
  EMPTY_FIELD,
  USER_NOT_FOUND,
  EXTRA_PARAMETERS,
} = require("../../models/helpers/consts");
const { INVALID_TOKEN } = require("../../auth/consts");
const User = require("../../models/user");
const request = supertest(server);

beforeAll(async () => {
  await knex(USER_TABLE_NAME).del();
  const res = await knex.select().from(USER_TABLE_NAME);
});

describe("Test User Controller Express", () => {
  describe("Test registerUser route", () => {
    test("Account creation when unique email,correct name and password of length greater than 8", async () => {
      const response = await request.post("/users/register").send({
        name: "Hadi",
        email: "unique@gmail.com",
        password: "Hadi12345",
      });
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty("token");
    });
    describe("Return errors for different usecases", () => {
      test("Return correct error code and message when un-unique email,correct name and password of length greater than 8", async () => {
        const response = await request.post("/users/register").send({
          name: "Hadi",
          email: "unique@gmail.com",
          password: "Hadi12345",
        });
        expect(response.statusCode).toBe(400);
        expect(response.body).toMatchObject({ error: DUPLICATE_EMAIL });
      });
      describe("Return correct error code when unique email and ....", () => {
        test("name of correct format and password<8", async () => {
          const response = await request.post("/users/register").send({
            name: "Hadiii",
            email: "unique1@gmail.com",
            password: "1234567",
          });
          expect(response.statusCode).toBe(400);
          expect(response.body).toMatchObject({
            error: INVALID_PWD,
          });
        });
        test("name of correct format and password==8", async () => {
          const response = await request.post("/users/register").send({
            name: "Hadiii",
            email: "unique1@gmail.com",
            password: "12345678",
          });
          expect(response.statusCode).toBe(400);
          expect(response.body).toMatchObject({
            error: INVALID_PWD,
          });
        });
      });
      describe("Return error for incorrect format type", () => {
        test("Incorrect name type", async () => {
          const response = await request.post("/users/register").send({
            name: 121,
            password: "123456789",
            email: "unique2@gmail.com",
          });
          expect(response.statusCode).toBe(400);
          expect(response.body).toMatchObject({ error: INVALID_NAME });
        });
        test("Incorrect email type(string but non-email)", async () => {
          const response = await request.post("/users/register").send({
            name: "Hadi",
            password: "123456789",
            email: "unique",
          });
          expect(response.statusCode).toBe(400);
          expect(response.body).toMatchObject({ error: INVALID_EMAIL });
        });
        test("Incorrect name type(not string)", async () => {
          const response = await request.post("/users/register").send({
            name: "Hadi",
            password: "123456789",
            email: 121,
          });
          expect(response.statusCode).toBe(400);
          expect(response.body).toMatchObject({ error: INVALID_EMAIL });
        });
        test("Incorrect password type", async () => {
          const response = await request.post("/users/register").send({
            name: "Hadi",
            password: 12345678,
            email: "unique2@gmail.com",
          });
          expect(response.statusCode).toBe(400);
          expect(response.body).toMatchObject({
            error: INVALID_PWD,
          });
        });
      });
      describe("Return error for missing parameters", () => {
        test("Missing name", async () => {
          const response = await request.post("/users/register").send({
            password: "123456789",
            email: "unique2@gmail.com",
          });
          expect(response.statusCode).toBe(400);
          expect(response.body).toMatchObject({ error: EMPTY_FIELD });
        });
        test("Missing email", async () => {
          const response = await request.post("/users/register").send({
            name: "Hadi",
            password: "123456789",
          });
          expect(response.statusCode).toBe(400);
          expect(response.body).toMatchObject({ error: EMPTY_FIELD });
        });
        test("Missing password", async () => {
          const response = await request.post("/users/register").send({
            name: "Hadi",
            email: "unique2@gmail.com",
          });
          expect(response.statusCode).toBe(400);
          expect(response.body).toMatchObject({ error: EMPTY_FIELD });
        });
        test("Missing all", async () => {
          const response = await request.post("/users/register").send({});
          expect(response.statusCode).toBe(400);
          expect(response.body).toMatchObject({ error: EMPTY_FIELD });
        });
      });
    });
  });
  describe("Test loginUser route", () => {
    test("Login user with valid credentials.Get token back", async () => {
      const response = await request
        .post("/users/login")
        .send({ email: "unique@gmail.com", password: "Hadi12345" });
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("token");
    });
    describe("Return correct error code and message for different usecases", () => {
      test("Valid email but wrong password", async () => {
        const response = await request
          .post("/users/login")
          .send({ email: "unique@gmail.com", password: "Hadi123456" });
        expect(response.statusCode).toBe(401);
        expect(response.body).toMatchObject({ error: USER_NOT_FOUND });
      });
      test("Both email and password wrong", async () => {
        const response = await request
          .post("/users/login")
          .send({ email: "uniqe@gmail.com", password: "Hadi123456" });
        expect(response.statusCode).toBe(401);
        expect(response.body).toMatchObject({ error: USER_NOT_FOUND });
      });
      describe("Return error for incorrect format type", () => {
        test("Incorrect email type(not string)", async () => {
          const response = await request
            .post("/users/login")
            .send({ email: 121, password: "Hadi123456" });
          expect(response.statusCode).toBe(400);
          expect(response.body).toMatchObject({ error: INVALID_EMAIL });
        });
        test("Incorrect email type(string but not email)", async () => {
          const response = await request
            .post("/users/login")
            .send({ email: "unique", password: "Hadi123456" });
          expect(response.statusCode).toBe(400);
          expect(response.body).toMatchObject({ error: INVALID_EMAIL });
        });
        test("Incorrect password type", async () => {
          const response = await request
            .post("/users/login")
            .send({ email: "unique@gmail.com", password: 1245 });
          expect(response.statusCode).toBe(400);
          expect(response.body).toMatchObject({ error: INVALID_PWD });
        });
      });
      describe("Return error for missinng fields", () => {
        test("Missing email", async () => {
          const response = await request
            .post("/users/login")
            .send({ password: 1245 });
          expect(response.statusCode).toBe(400);
          expect(response.body).toMatchObject({ error: EMPTY_FIELD });
        });
        test("Missing password", async () => {
          const response = await request
            .post("/users/login")
            .send({ email: "Hadi111@gmail.com" });
          expect(response.statusCode).toBe(400);
          expect(response.body).toMatchObject({ error: EMPTY_FIELD });
        });
        test("Missing all", async () => {
          const response = await request.post("/users/login").send({});
          expect(response.statusCode).toBe(400);
          expect(response.body).toMatchObject({ error: EMPTY_FIELD });
        });
      });
    });
  });
  describe("Test getUser route", () => {
    let token;
    beforeAll(async () => {
      const response = await request
        .post("/users/login")
        .send({ email: "unique@gmail.com", password: "Hadi12345" });
      token = response.body.token;
    });
    test("Get user if valid token given", async () => {
      const response = await request
        .get("/users/me")
        .set("authorization", token)
        .send();
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("user");
      const user = response.body.user;
      const decryptedEmail = jwt.verify(token, process.env.JWT_SECRET);
      expect(decryptedEmail).toBe(user.email);
    });
    describe("Return proper errors for different usecases", () => {
      test("No token given", async () => {
        const response = await request.get("/users/me").send();
        expect(response.statusCode).toBe(400);
        expect(response.body).toMatchObject({ error: INVALID_TOKEN });
      });
      test("Invalid token given", async () => {
        const response = await request
          .get("/users/me")
          .set("authorization", "kjasdh")
          .send();
        expect(response.statusCode).toBe(400);
        expect(response.body).toMatchObject({ error: INVALID_TOKEN });
      });
    });
  });
  describe("Test updateUser route", () => {
    let token;
    beforeAll(async () => {
      const response = await request
        .post("/users/login")
        .send({ email: "unique@gmail.com", password: "Hadi12345" });
      token = response.body.token;
    });
    describe("Update user if correct fields, token and values", () => {
      test("Update all fields", async () => {
        const response = await request
          .patch("/users/me")
          .set("authorization", token)
          .send({
            name: "uniqueName",
            password: "sssssssssss",
          });
        expect(response.statusCode).toBe(200);
        const user = await User.getUser("unique@gmail.com");
        const updatePass = await bcrypt.compare("sssssssssss", user.password);
        expect(updatePass).toBeTruthy();
        expect(user.name).toBe("uniqueName");
      });
      test("Update only username", async () => {
        const response = await request
          .patch("/users/me")
          .set("authorization", token)
          .send({
            name: "uniquerrrrrrName",
          });
        expect(response.statusCode).toBe(200);
        const user = await User.getUser("unique@gmail.com");
        expect(user.name).toBe("uniquerrrrrrName");
      });
      test("Update only password", async () => {
        const response = await request
          .patch("/users/me")
          .set("authorization", token)
          .send({
            password: "pass1212",
          });
        expect(response.statusCode).toBe(200);
        const user = await User.getUser("unique@gmail.com");
        const updatePass = await bcrypt.compare("pass1212", user.password);
        expect(updatePass).toBeTruthy();
      });
    });
    describe("Return error code for different usecases", () => {
      describe("Token issue", () => {
        test("Invalid token string", async () => {
          const response = await request
            .patch("/users/me")
            .set("authorization", "12121")
            .send({
              name: "uniquerrrrrrName",
            });
          expect(response.statusCode).toBe(400);
          expect(response.body).toMatchObject({ error: INVALID_TOKEN });
        });
        test("Invalid token(incorrect type)", async () => {
          const response = await request
            .patch("/users/me")
            .set("authorization", 12121)
            .send({
              name: "uniquerrrrrrName",
            });
          expect(response.statusCode).toBe(400);
          expect(response.body).toMatchObject({ error: INVALID_TOKEN });
        });
        test("No token", async () => {
          const response = await request.patch("/users/me").send({
            name: "uniquerrrrrrName",
          });
          expect(response.statusCode).toBe(400);
          expect(response.body).toMatchObject({ error: INVALID_TOKEN });
        });
      });
      describe("Incorrect number of fields", () => {
        test("Extra fields alongside valid fields", async () => {
          const response = await request
            .patch("/users/me")
            .set("authorization", token)
            .send({
              name: "uniquerrrrrrName",
              extraField: "extra",
            });
          expect(response.statusCode).toBe(400);
          expect(response.body).toMatchObject({ error: EXTRA_PARAMETERS });
        });
        test("Only extra fields", async () => {
          const response = await request
            .patch("/users/me")
            .set("authorization", token)
            .send({
              newField: "uniquerrrrrrName",
              extraField: "extra",
            });
          expect(response.statusCode).toBe(400);
          expect(response.body).toMatchObject({ error: EXTRA_PARAMETERS });
        });
        test("No fields", async () => {
          const response = await request
            .patch("/users/me")
            .set("authorization", token)
            .send({});
          expect(response.statusCode).toBe(400);
          expect(response.body).toMatchObject({ error: EMPTY_FIELD });
        });
        test("Email field detected", async () => {
          const response = await request
            .patch("/users/me")
            .set("authorization", token)
            .send({
              name: "uniquerrrrrrName",
              email: "new@gmail.com",
            });
          expect(response.statusCode).toBe(400);
          expect(response.body).toMatchObject({ error: EXTRA_PARAMETERS });
        });
      });
      describe("Invalid field types", () => {
        test("Invalid name field", async () => {
          const response = await request
            .patch("/users/me")
            .set("authorization", token)
            .send({
              name: 121,
            });
          expect(response.statusCode).toBe(400);
          expect(response.body).toMatchObject({ error: INVALID_NAME });
        });
        test("Invalid password field", async () => {
          const response = await request
            .patch("/users/me")
            .set("authorization", token)
            .send({
              password: 121345,
            });
          expect(response.statusCode).toBe(400);
          expect(response.body).toMatchObject({ error: INVALID_PWD });
        });
      });
    });
  });
  describe("Test deleteUser route", () => {
    let token;
    beforeAll(async () => {
      const response = await request
        .post("/users/login")
        .send({ email: "unique@gmail.com", password: "pass1212" });
      token = response.body.token;
    });
    test("Delete user if correct token provided", async () => {
      expect.assertions(2);
      const response = await request
        .delete("/users/me")
        .set("authorization", token)
        .send();
      expect(response.statusCode).toBe(200);
      try {
        const user = await User.getUser("unique@gmail.com");
      } catch (error) {
        expect(error.message).toBe(USER_NOT_FOUND);
      }
    });
    describe("Return error code for different usecases", () => {
      describe("Token issue", () => {
        test("Old token provided(of deleted user)", async () => {
          const response = await request
            .delete("/users/me")
            .set("authorization", token)
            .send();
          expect(response.statusCode).toBe(400);
          expect(response.body).toMatchObject({ error: INVALID_TOKEN });
        });
        test("Invalid token string", async () => {
          const response = await request
            .delete("/users/me")
            .set("authorization", "12121")
            .send();
          expect(response.statusCode).toBe(400);
          expect(response.body).toMatchObject({ error: INVALID_TOKEN });
        });
        test("Invalid token(incorrect type)", async () => {
          const response = await request
            .delete("/users/me")
            .set("authorization", 12121)
            .send();
          expect(response.statusCode).toBe(400);
          expect(response.body).toMatchObject({ error: INVALID_TOKEN });
        });
        test("No token", async () => {
          const response = await request.delete("/users/me").send();
          expect(response.statusCode).toBe(400);
          expect(response.body).toMatchObject({ error: INVALID_TOKEN });
        });
      });
    });
  });
});
