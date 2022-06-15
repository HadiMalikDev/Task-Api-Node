const jwt = require("jsonwebtoken");
const { getEmail } = require("../cache/redis");
const { isValidEmail } = require("../models/helpers/consts");
const User = require("../models/user");
const { INVALID_TOKEN, EXPIRED_TOKEN, UNVERIFIED_USER } = require("./consts");

const generateToken = (email) => {
  const token = jwt.sign({email}, process.env.JWT_SECRET);
  return token;
};
const generateVerificationToken = (email) => {
  //Token expiry in 30 minutes
  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: 1800,
  });
  return token;
};
const verifyToken = async (token) => {
  if (!token) throw Error(INVALID_TOKEN);
  let email;
  try {
    const res = jwt.verify(token, process.env.JWT_SECRET);
    email = res.email;
  } catch (error) {
    if (error.name === "TokenExpiredError") throw Error(EXPIRED_TOKEN);
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
    if (!owner.isVerified) throw Error(UNVERIFIED_USER);
    email = owner.email;
    try {
      await setEmailForToken(token, email);
    } catch (error) {}
  }
  return email;
};

module.exports = {
  generateToken,
  generateVerificationToken,
  getTokenEmail,
  verifyToken,
};
