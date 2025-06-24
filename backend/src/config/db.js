const mongoose = require("mongoose");
require("dotenv").config();

async function runDB() {
  await mongoose.connect(process.env.DB_URL);
  await mongoose.connection.db
    .admin()
    .command({ ping: 1 })

    .then(() => {
      console.log(
        "Pinged your deployment. You successfully connected to MongoDB!"
      );
    })
    .catch((err) => {
      console.error("Failed to connect to MongoDB", err);
    });
}

module.exports = runDB;
