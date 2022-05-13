const User = require("../models/user");
const {
  EMPTY_FIELD,
  OPERATION_FAILED,
  USER_NOT_FOUND,
  INVALID_PWD,
} = require("../models/helpers/consts");
const { generateToken } = require("../auth/auth");
const bcrypt = require("bcrypt");

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: EMPTY_FIELD });
  if (typeof password != "string" || password.length <= 8)
    return res.status(400).json({ error: INVALID_PWD });
  try {
    const encryptedPass = await bcrypt.hash(password, 8);
    await User.createUser(name, email, encryptedPass);

    const token = generateToken(email);
    return res.status(201).json({ token });
  } catch (error) {
    if (error.message === OPERATION_FAILED)
      return res.status(500).json({ error: OPERATION_FAILED });
    return res.status(400).json({ error: error.message });
  }
};
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: EMPTY_FIELD });
  if (typeof password != "string")
    return res.status(400).json({ error: INVALID_PWD });
  try {
    const user = await User.getUser(email);
    if (!(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ error: USER_NOT_FOUND });

    const token = generateToken(email);
    return res.status(200).json({ token: token });
  } catch (error) {
    let errorCode;
    if (error.message === USER_NOT_FOUND) errorCode = 401;
    else if (error.message === OPERATION_FAILED) errorCode = 500;
    else errorCode = 400;

    return res.status(errorCode).json({ error: error.message });
  }
};
const getUser = async (req, res) => {
  return res.status(200).send({ user: req.user });
};
const updateUser = async (req, res) => {
  const updateFields = req.body;
  try {
    if (updateFields.password) {
      if (typeof updateFields.password != "string") throw Error(INVALID_PWD);
      updateFields.password = await bcrypt.hash(updateFields.password, 8);
    }

    await User.updateUser(req.user.email, updateFields);
    return res.status(200).send();
  } catch (error) {
    const errorCode = error.message === OPERATION_FAILED ? 500 : 400;
    return res.status(errorCode).json({ error: error.message });
  }
};
const deleteUser = async (req, res) => {
  try {
    await User.deleteUser(req.user.email);
    return res.status(200).send();
  } catch (error) {
    const errorCode = error.message === OPERATION_FAILED ? 500 : 400;
    return res.status(errorCode).json({ error: error.message });
  }
};

module.exports = { registerUser, loginUser, getUser, updateUser, deleteUser };
