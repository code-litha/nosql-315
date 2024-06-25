const { ObjectId } = require("mongodb");
const { getDatabase } = require("../config/mongoConnection");

const getCollection = () => {
  const db = getDatabase();
  const productCollection = db.collection("products");
  return productCollection;
};

const findAllProduct = async () => {
  // const products = await getCollection().find().toArray();
  const agg = [
    {
      $lookup: {
        from: "users",
        localField: "authorId",
        foreignField: "_id",
        as: "author",
      },
    },
    {
      $unwind: {
        path: "$author",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $sort: {
        name: 1,
      },
    },
    {
      $project: {
        "author.password": 0,
      },
    },
  ];

  const products = await getCollection().aggregate(agg).toArray();

  // console.log(products, "<<< products");

  return products;
};

const findOneProductById = async (id = "") => {
  const product = await getCollection().findOne({
    _id: new ObjectId(id),
  });

  return product;
};

const createProduct = async (payload) => {
  const productCollection = getCollection();

  const newProduct = await productCollection.insertOne(payload);

  const product = await productCollection.findOne({
    _id: new ObjectId(newProduct.insertedId),
  });

  return product;
};

module.exports = {
  getProductCollection: getCollection,
  findAllProduct,
  findOneProductById,
  createProduct,
};
