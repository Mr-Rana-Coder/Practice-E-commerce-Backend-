import { connectDb } from "./db/index.js";
import { app } from "./app.js";
import dotenv from "dotenv";

dotenv.config({
    path: "./env"
})

connectDb()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`The server is running successfully on ${process.env.PORT}`)
        })})
        .catch((err) => {
            console.log("There is a problem while connecting the server ", err);
        })
