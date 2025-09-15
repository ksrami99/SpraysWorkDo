import app from "./app.js";
import dotenv from "dotenv";
import { pool } from "./db/index.js";

dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT || 3000;

pool
  .getConnection()
  .then(() => {
    console.log("DB Connected successfully");
    app.listen(PORT, () => {
      console.log(`Server is listening at port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error while connecting to DB:", err.message);
    process.exit(1);
  });
