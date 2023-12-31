const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

process.on("uncaughtException", (err) => {
  console.error(`${err.name}. Server is shutting down.`);
  console.error(err.message);
  process.exit(1);
});

const app = require("./app");
const mongoose = require("mongoose");

(async () => {
  try {
    await mongoose.connect(process.env.URI);
    console.log("Connection to the database is successfuly.");
  } catch (e) {
    console.error(`There was an error while connecting to the database: ${e}`);
  }
})();

const server = app.listen(process.env.PORT, () =>
  console.log(`Server is running on PORT: ${process.env.PORT}`)
);

process.on("unhandledRejection", (err) => {
  console.error(`${err.name}. Server is shutting down.`);
  console.error(err.message);
  server.close(() => process.exit(1));
});
