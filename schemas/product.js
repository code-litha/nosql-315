const { GraphQLError } = require("graphql");
const {
  findAllProduct,
  findOneProductById,
  createProduct,
} = require("../models/product");
const { getDatabase, client } = require("../config/mongoConnection");
const { ObjectId } = require("mongodb");
const redis = require("../config/redis");

/*
collection orders = {
  _id
  productId
  userId 
  quantity
  totalPrice
}
*/
const typeDefs = `#graphql
  type Product {
    _id: ID
    name: String
    price: Int
    stock: Int
    authorId: ID
    author: User
  }

  type Order {
    _id: ID
    productId: ID
    userId: ID
    quantity: Int
    totalPrice: Int
  }

  type Query {
    getProducts: [Product]
    getProductById(productId: ID!): Product
  }

  input OrderInput {
    productId: ID
    quantity: Int
  }

  type Mutation {
    addProduct(name: String, price: Int, stock: Int): Product
    addImages(url: String!, productId: ID!): Product
    orderProduct(payload: OrderInput): Order
  }
`;

const resolvers = {
  Query: {
    getProducts: async (_parents, _args, contextValue) => {
      const userLogin = await contextValue.auth();

      /*
        1. cari products di dalam redis
        2. kalau ada, maka return
        3. kalau tidak ada, maka ambil dari database
        4. simpan hasil dari database ke dalam redis
        5. return hasil dari database
      */

      const productCache = await redis.get("data:products");
      console.log(productCache);

      if (productCache) {
        return JSON.parse(productCache);
      }

      const products = await findAllProduct(); // array of object

      await redis.set("data:products", JSON.stringify(products));

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

      await redis.del("data:products"); // Invalidate cache

      return product;
    },
    orderProduct: async (_parent, args, contextValue) => {
      const session = client.startSession();
      try {
        session.startTransaction();
        const userLogin = await contextValue.auth();
        // console.log(args);
        const { productId, quantity } = args.payload;

        // const findProduct = await findOneProductById(productId);
        const db = getDatabase();
        const findProduct = await db.collection("products").findOne(
          {
            _id: new ObjectId(productId),
          },
          {
            session,
          }
        );

        if (!findProduct) {
          throw new GraphQLError("Product Not Found");
        }

        if (findProduct.stock < quantity) {
          throw new GraphQLError("Out of stock");
        }

        const totalPrice = findProduct.price * quantity;

        const payloadOrder = {
          productId,
          userId: userLogin._id,
          quantity,
          totalPrice,
        };

        const newOrder = await db
          .collection("orders")
          .insertOne(payloadOrder, { session }); // { insertedId, acknowledge }

        console.log(findProduct);
        await db.collection("products").updateOne(
          { _id: findProduct._id },
          {
            $set: {
              stock: findProduct.stock - quantity,
            },
          },
          { session }
        );

        const order = await db.collection("orders").findOne(
          {
            _id: newOrder.insertedId,
          },
          { session }
        );

        await session.commitTransaction();

        return order;
      } catch (error) {
        await session.abortTransaction;

        throw error;
      } finally {
        await session.endSession();
      }
    },
  },
};

module.exports = {
  productTypeDefs: typeDefs,
  productResolvers: resolvers,
};
