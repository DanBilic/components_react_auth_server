const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");
const connectDB = require("./config/db");

//load env variables
dotenv.config({ path: "./config/config.env" });

connectDB();

//Route files
//const user = require('./routes/user);

const app = express();

// DEV logging middlewar
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//Mount routers
//app.use("/api/v1/user", user);

//API routes

const PORT = process.env.PORT || 7000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

//handle unhandled promise rejections
process.on("unhandeledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);

  //close server & exit process
  server.close(() => process.exit(1));
});
