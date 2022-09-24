const express = require("express");
const dbConnect = require("./db/dbConnect");

// Routes
const userRouter = require("./routes/user");
const app = express();

app.use(express.json());

dbConnect();

app.use("/api/users", userRouter);

app.listen(8000, () => {
  console.log(`Server listing on port 8000`);
});
