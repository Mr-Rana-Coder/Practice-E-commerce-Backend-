import { connectDb } from "./db/index.js";
import { app } from "./app.js";
import dotenv from "dotenv";
import { ApiError } from "./utils/apiError.js";

dotenv.config({
    path: "./env"
})

connectDb()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`The server is running successfully on ${process.env.PORT}`)
        })
    })
    .catch((err) => {
        console.error("There is a problem while connecting the server ", err);
        throw new ApiError(500, "Unable to connect to Database")
    })
