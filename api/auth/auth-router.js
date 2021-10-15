const router = require("express").Router();
const bcrypt = require("bcryptjs");
const Users = require("./auth-model");
const buildToken = require("./token-builder");
const {
  checkUsernameFree,
  checkUsernameExists,
  validateUser,
} = require("./auth-middleware");

router.post("/register", checkUsernameFree, async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const hash = bcrypt.hashSync(password, 8);
    const user = { username, password: hash };
    const newUser = await Users.add(user);
    res.status(201).json(newUser);
  } catch (err) {
    next(err);
  }
});

router.post("/login", checkUsernameExists, validateUser, (req, res, next) => {
  const { password } = req.body;
  if (bcrypt.compareSync(password, res.user.password)) {
    const token = buildToken(res.user);
    res.status(200).json({
      message: `welcome, ${res.user.username}`,
      token,
    });
  } else {
    next({ status: 401, message: "invalid credentials" });
  }
});

module.exports = router;
