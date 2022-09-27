const express = require("express");
const dbConnect = require("./db/dbConnect");
const dotenv = require("dotenv");
const morgan = require("morgan");
require("express-async-errors");

dotenv.config();

// Routes
const userRouter = require("./routes/user");
const { errorHandler } = require("./middlewares/error");
const app = express();

app.use(express.json());
app.use(morgan("dev"));

// Error Handling
app.use(errorHandler);

dbConnect();

app.use("/api/users", userRouter);

app.listen(8000, () => {
  console.log(`Server listing on port 8000`);
});
