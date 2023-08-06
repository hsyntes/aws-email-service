const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

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

app.listen(process.env.PORT, () =>
  console.log(`Server is running on PORT: ${process.env.PORT}`)
);
