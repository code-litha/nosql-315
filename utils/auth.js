const { GraphQLError } = require("graphql");
const { verifyToken } = require("./jwt");
const { findUserById } = require("../models/user");

const authentication = async (req) => {
  // console.log("auth pada context kepanggil");
  // console.log(req.headers.authorization, "<<< headers auth");
  const authorization = req.headers.authorization;

  if (!authorization) {
    throw new GraphQLError("Invalid token", {
      extensions: {
        http: {
          status: 401,
        },
      },
    });
  }

  const token = authorization.split(" ")[1];

  if (!token) {
    throw new GraphQLError("Invalid token", {
      extensions: {
        http: {
          status: 401,
        },
      },
    });
  }

  const decodedToken = verifyToken(token);

  // console.log(decodedToken, "<<< decoded token");
  const user = await findUserById(decodedToken.id);

  delete user.password;
  // console.log(user, "<<< user");
  return user;
};

module.exports = authentication;
