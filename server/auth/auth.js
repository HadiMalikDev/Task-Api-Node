const jwt = require("jsonwebtoken");
const { getEmail } = require("../cache/redis");
const { isValidEmail } = require("../models/helpers/consts");
const User = require("../models/user");
const { INVALID_TOKEN } = require("./consts");

const generateToken = (email) => {
  const token = jwt.sign(email, process.env.JWT_SECRET);
  return token;
};

const verifyToken = async (token) => {
  if (!token) throw Error(INVALID_TOKEN);
  let email;
  try {
    email = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw Error(INVALID_TOKEN);
  }
  if (!isValidEmail(email)) throw Error(INVALID_TOKEN);
  const user = await User.getUser(email);
  return user;
};
const getTokenEmail = async (token) => {
  let email = await getEmail(token);
  if (!email) {
    const owner = await verifyToken(token);
    email = owner.email;
    try {
      await setEmailForToken(token, email);
    } catch (error) {}
  }
  return email;
};

module.exports = { generateToken, getTokenEmail, verifyToken };
