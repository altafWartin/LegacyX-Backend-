const mongoose = require("mongoose");
const { MONGODB_CONNECTION_STRING } = require("../config/index");

const dbConnect = async () => {
  try {
    const con = await mongoose.connect("mongodb+srv://legacyempire1:Legacy140399@cluster0.9qqagie.mongodb.net/", {
      dbName: "legacyProd",
    });
    console.log(`Database connected to host: ${con.connection.host}`);
  } catch (error) {
    console.log(`Error: ${error}`);
  }
};

module.exports = dbConnect;
