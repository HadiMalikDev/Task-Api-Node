const Redis = require("ioredis");
const REDIS_OPERATION_FAILED = "Operation failed";
const redis = new Redis(process.env.REDIS_PORT, process.env.REDIS_HOST, {
  password: process.env.REDIS_PASS,
});
//In seconds
//Equals one day
const TimeToExpire = 24 * 60 * 60;
const getEmail = async (token) => {
  try {
    if (!token) return null;
    const email = await redis.get(token);
    return email;
  } catch (error) {
    return null;
  }
};
const setEmailForToken = async (token, email) => {
  try {
    if (
      !token ||
      !email ||
      typeof token != "string" ||
      typeof email != "string"
    )
      throw Error(REDIS_OPERATION_FAILED);
    const res = await redis.set(token, email,'ex',TimeToExpire);
    if (res != "OK") throw Error(REDIS_OPERATION_FAILED);
  } catch (error) {
    throw Error(REDIS_OPERATION_FAILED);
  }
};
const clearCache = async () => {
  await redis.flushdb();
};
module.exports = {
  clearCache,
  getEmail,
  setEmailForToken,
  REDIS_OPERATION_FAILED,
};
