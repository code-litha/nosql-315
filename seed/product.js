const { mongoConnect } = require("../config/mongoConnection");
const { getProductCollection } = require("../models/product");
const { createUser } = require("../models/user");

const products = [
  {
    name: "Baju Kerah Panjang",
    price: 100_000,
    stock: 20,
  },
  {
    name: "Celana Panjang",
    price: 200_000,
    stock: 30,
  },
  {
    name: "Kemeja Pendek Merah",
    price: 50_000,
    stock: 15,
  },
];

(async function () {
  try {
    await mongoConnect();

    const admin = await createUser({
      username: "admin",
      password: "password",
      email: "admin@mail.com",
    });

    const payloadProducts = products.map((product) => {
      product.authorId = admin._id;
      return product;
    });

    await getProductCollection().insertMany(payloadProducts);

    console.log(`SUCCESSFULLY SEED DATA PRODUCTS`);
  } catch (error) {
    console.log(error);
  }
})();
