const {
  findAllProduct,
  findOneProductById,
  createProduct,
} = require("../models/product");

const typeDefs = `#graphql
  type Product {
    _id: ID
    name: String
    price: Int
    stock: Int
    authorId: ID
    author: User
  }

  type Query {
    getProducts: [Product]
    getProductById(productId: ID!): Product
  }

  type Mutation {
    addProduct(name: String, price: Int, stock: Int): Product
    addImages(url: String!, productId: ID!): Product
  }
`;

const resolvers = {
  Query: {
    getProducts: async (_parents, _args, contextValue) => {
      const userLogin = await contextValue.auth();

      const products = await findAllProduct();

      return products;
    },
    getProductById: async (_parent, args) => {
      const product = await findOneProductById(args.productId);

      return product;
    },
  },
  Mutation: {
    addProduct: async (_parent, args, contextValue) => {
      const userLogin = await contextValue.auth();

      const product = await createProduct({
        name: args.name,
        price: args.price,
        stock: args.stock,
        authorId: userLogin._id,
      });

      return product;
    },
  },
};

module.exports = {
  productTypeDefs: typeDefs,
  productResolvers: resolvers,
};
