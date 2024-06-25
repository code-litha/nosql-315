const bcrypt = require("bcryptjs");

const hashPassword = (password = "") => {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  return hash;
};

const comparePassword = (plainPass = "", hashPass = "") => {
  return bcrypt.compareSync(plainPass, hashPass);
};

module.exports = {
  hashPassword,
  comparePassword,
};
