import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    Credential: true
}));

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"))
app.use(cookieParser())

//importing ALl routes
import { router as userRouter } from "./routes/user.route.js";
import { router as wishlistRouter } from "./routes/wishlist.route.js";
import { router as reviewRouter } from "./routes/review.route.js";
import { router as productRouter } from "./routes/product.route.js";
import { router as paymentRouter } from "./routes/payment.route.js";
import { router as orderRouter } from "./routes/order.route.js";
import { router as categoryRouter } from "./routes/category.route.js";
import { router as cartRouter } from "./routes/cart.route.js";
import { router as addressRouter } from "./routes/address.route.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/wishlist", wishlistRouter);
app.use("/api/v1/review", reviewRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/address", addressRouter);

export { app }