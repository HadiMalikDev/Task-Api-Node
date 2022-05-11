const jwt = require("jsonwebtoken");
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
  if (!user) throw Error(INVALID_TOKEN);

  return user;
};

module.exports = { generateToken, verifyToken };
