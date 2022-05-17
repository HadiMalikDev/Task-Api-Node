const express = require("express");
const {
  registerUser,
  loginUser,
  getUser,
  updateUser,
  deleteUser,
} = require("../controllers/user");
const auth = require("../middleware/auth");
const getEmailUser = require("../middleware/get_token_user");

const userRouter = express.Router();

userRouter.post("/users/register", registerUser);
userRouter.post("/users/login", loginUser);

//Middleware protected routes
userRouter.get("/users/me", auth, getEmailUser, getUser);
userRouter.patch("/users/me", auth, updateUser);
userRouter.delete("/users/me", auth, deleteUser);

module.exports = userRouter;
