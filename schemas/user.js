const { GraphQLError } = require("graphql");
const { createUser, findAllUser, findUserByEmail } = require("../models/user");
const { comparePassword } = require("../utils/bcrypt");
const { generateToken } = require("../utils/jwt");

const typeDefs = `#graphql
  type User {
    _id: ID
    username: String!
    email: String!
    password: String
  }

  input RegisterInput {
    username: String!
    email: String!
    password: String!
  }

  type ResponseLogin {
    token: String
  }

  type Query {
    getAllUsers: [User]
  }

  type Mutation {
    register(payload: RegisterInput): User
    login(email: String!, password: String!): ResponseLogin
  }
`;

const resolvers = {
  Query: {
    getAllUsers: async (_, args) => {
      const users = await findAllUser();

      return users;
    },
  },
  Mutation: {
    register: async (_, args) => {
      const { payload } = args;

      const user = await createUser(payload);

      return user;
    },
    login: async (_, args) => {
      const { email, password } = args;

      const user = await findUserByEmail(email);

      if (!user) {
        // throw new Error("Invalid email/password");
        throw new GraphQLError("Invalid email/password", {
          extensions: {
            http: {
              status: 401,
            },
          },
        });
      }

      const isValidPassword = comparePassword(password, user.password);

      if (!isValidPassword) {
        // throw new Error("Invalid email/password");
        throw new GraphQLError("Invalid email/password", {
          extensions: {
            http: {
              status: 401,
            },
          },
        });
      }

      const payload = {
        id: user._id,
        email: user.email,
      };

      const token = generateToken(payload);

      return { token };
    },
  },
};

module.exports = {
  userTypeDefs: typeDefs,
  userResolvers: resolvers,
};
