require("dotenv").config();

const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const PORT = process.env.PORT || 3000;
const { mongoConnect } = require("./config/mongoConnection");
const { userTypeDefs, userResolvers } = require("./schemas/user");
const { productTypeDefs, productResolvers } = require("./schemas/product");
const authentication = require("./utils/auth");

const server = new ApolloServer({
  typeDefs: [userTypeDefs, productTypeDefs],
  resolvers: [userResolvers, productResolvers],
});

(async () => {
  try {
    await mongoConnect();
    const { url } = await startStandaloneServer(server, {
      listen: {
        port: PORT,
      },
      context: async ({ req, res }) => {
        // console.log("context kepanggil");
        return {
          auth: async () => {
            return await authentication(req);
          },
        };
      },
    });
    console.log(`🚀  Server ready at: ${url}`);
  } catch (error) {
    console.log(error);
  }
})();
