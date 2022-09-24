const mongoose = require("mongoose");

DB_URI = "mongodb://127.0.0.1:27017/mern_movie_review";
const dbConnect = () => {
  mongoose
    .connect(DB_URI)
    .then(() => {
      console.log("DB is connected");
    })
    .catch((err) => {
      console.log("DB connection failed", err);
    });
};

module.exports = dbConnect;
