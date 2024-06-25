require("dotenv").config();

const { MongoClient } = require("mongodb");

const url = process.env.MONGODB_URI;

const client = new MongoClient(url);

const dbName = "db_bsd_15";
let database;

async function mongoConnect() {
  try {
    // Use connect method to connect to the server
    await client.connect();
    console.log("Connected successfully to MongoDB Server");
    database = client.db(dbName); // harus ke passing value db ini ke setiap schema

    return database;
  } catch (error) {
    console.log(error, "<<< error");
    throw error;
  }
}

function getDatabase() {
  return database;
}

module.exports = {
  mongoConnect,
  getDatabase,
};
