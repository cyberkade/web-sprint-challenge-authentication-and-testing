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
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.
    DO NOT EXCEED 2^8 ROUNDS OF HASHING!

    1- In order to register a new account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel", // must not exist already in the `users` table
        "password": "foobar"          // needs to be hashed before it's saved
      }

    2- On SUCCESSFUL registration,
      the response body should have `id`, `username` and `password`:
      {
        "id": 1,
        "username": "Captain Marvel",
        "password": "2a$08$jG.wIGR2S4hxuyWNcBf9MuoC4y0dNy7qC/LbmtuFBSdIhWks2LhpG"
      }

    3- On FAILED registration due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED registration due to the `username` being taken,
      the response body should include a string exactly as follows: "username taken".
  */
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
