const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");
const cors = require("cors");
const errorHandler = require("./middleware/error");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

//security middlewares
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");

//load env variables
dotenv.config({ path: "./config/config.env" });

connectDB();

//Route files
const auth = require("./routes/auth");

const app = express();

//Body parser
app.use(express.json());

//sanitize mongo data
app.use(mongoSanitize());

//set security headers
app.use(helmet());

//prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100,
});
app.use(limiter);

//prevent http param polution
app.use(hpp());

//enable CORS
app.use(cors());

//cookie parser
app.use(cookieParser());

// DEV logging middlewar
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//Mount routers
app.use("/api/v1/auth", auth);

//API routes

app.use(errorHandler);

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
