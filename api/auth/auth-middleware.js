const Users = require("./auth-model");

const checkUsernameFree = async (req, res, next) => {
  const { username } = req.body;
  const user = await Users.findBy({ username }).first();
  if (!user) {
    next();
  } else {
    next({ status: 401, message: "username taken" });
  }
};

const checkUsernameExists = async (req, res, next) => {
  const { username } = req.body;
  const user = await Users.findBy({ username }).first();
  if (user) {
    res.user = user;
    next();
  } else {
    next({ status: 401, message: "invalid credentials" });
  }
  next();
};

const validateUser = async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    next({ status: 400, message: "username and password required" });
  }
  next();
};

module.exports = {
  checkUsernameFree,
  checkUsernameExists,
  validateUser,
};
