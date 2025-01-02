import express from "express";
import bodyParser from "body-parser";
import passport from "./config/passportConfig";
import authRoutes from "./routes/authRoutes";
import productRoutes from "./routes/productRoutes";
import cartRoutes from "./routes/cartRoutes";
import orderRoutes from "./routes/orderRoutes";
import PaymentRoutes from "./routes/paymentRoutes";
import Subcategory from "./routes/subcategory";
import categoryRoutes from "./routes/categoryRoutes";
import setAdmin from "./routes/setAdminRoutes";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(passport.initialize());

app.get("/", (req, res) => {
  res.send("E-commerce API is running...");
});

app.use("/auth", authRoutes);
app.use("/setAdmin", setAdmin);
app.use("/category", categoryRoutes);
app.use("/subcategory", Subcategory);
app.use("/prodect", productRoutes);
app.use("/cart", cartRoutes);
app.use("/order", orderRoutes);
app.use("/checkout", PaymentRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
