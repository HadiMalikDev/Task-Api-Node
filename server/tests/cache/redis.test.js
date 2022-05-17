const {
  clearCache,
  setEmailForToken,
  getEmail,
  REDIS_OPERATION_FAILED,
} = require("../../cache/redis");

describe("Redis Cache Tests", () => {
  beforeAll(async () => {
    await clearCache();
  });
  afterAll(async () => {
    await clearCache();
  });
  describe("Test setEmailForToken operation", () => {
    test("Set correct token for email provided", async () => {
      const token = "1234567.sda@";
      const email = "hadi@gmail.com";
      return expect(setEmailForToken(token, email)).resolves;
    });
    test("Throw error if non-string email", async () => {
      expect.assertions(1);
      try {
        const token = "1234567.sda@";
        const email = 1234;
        await setEmailForToken(token, email);
      } catch (error) {
        expect(error.message).toBe(REDIS_OPERATION_FAILED);
      }
    });
    test("Throw error if non-string token", async () => {
      try {
        const token = 1212;
        const email = "hadi@gmail.com";
        await setEmailForToken(token, email);
      } catch (error) {
        expect(error.message).toBe(REDIS_OPERATION_FAILED);
      }
    });
    test("Throw error if empty email", async () => {
      try {
        const token = "1234567.sda@";
        const email = "";
        await setEmailForToken(token, email);
      } catch (error) {
        expect(error.message).toBe(REDIS_OPERATION_FAILED);
      }
    });
    test("Throw error if empty token", async () => {
      try {
        const token = "";
        const email = "hadi@gmail.com";
        await setEmailForToken(token, email);
      } catch (error) {
        expect(error.message).toBe(REDIS_OPERATION_FAILED);
      }
    });
  });
  describe("Test getEmail operation", () => {
    test("Get correct email if token provided", async () => {
      const email = await getEmail("1234567.sda@");
      expect(email).toBe("hadi@gmail.com");
    });
    test("Return null if given token does not exist", async () => {
      const email = await getEmail("kasdjo");
      expect(email).toBeNull();
    });
    test("Return null if token not a string", async () => {
      const email = await getEmail(1234567);
      expect(email).toBeNull();
    });
  });
});
