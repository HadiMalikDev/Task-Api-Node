const { USER_NOT_FOUND } = require("../models/helpers/consts");
const User = require("../models/user");

const getEmailUser = async (req, res, next) => {
  try {
    const user = await User.getUser(req.user.email);
    req.user = user;
    next();
  } catch (error) {
    let errorCode;
    errorCode = error.message === USER_NOT_FOUND ? 400 : 500;
    return res.status(errorCode).json({ error: AUTH_FAILED });
  }
};

module.exports=getEmailUser