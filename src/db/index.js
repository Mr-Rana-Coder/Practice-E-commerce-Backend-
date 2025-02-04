import mongoose from "mongoose";
import { dbName } from "../constants.js";

const connectDb = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${dbName}`)
        console.log("The database has been connected on this instance", connectionInstance.connection.host)
    } catch (err) {
        console.error("There is an error while connecting the Database", err)
        process.exit(1)
    }
}

export { connectDb }