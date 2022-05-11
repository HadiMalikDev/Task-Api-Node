const authh = require("../auth/auth");
const { INVALID_TOKEN, AUTH_FAILED } = require("../auth/consts");

const auth = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(400).json({ error: INVALID_TOKEN });
  try {
    const owner = await authh.verifyToken(token);
    req.user = owner;
    next();
  } catch (error) {
    if (error.message === INVALID_TOKEN)
      return res.status(400).json({ error: INVALID_TOKEN });
    return res.status(500).json({ error: AUTH_FAILED });
  }
};

module.exports = auth;
