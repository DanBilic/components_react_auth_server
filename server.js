const express = require("express");
const dotenv = require("dotenv");

//load env variables
dotenv.config({ path: "./config/config.env" });

const app = express();

const PORT = process.env.PORT || 7000;

app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
