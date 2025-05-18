const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose"); // Không cần destructuring
const cors = require("cors");
const bodyParser = require("body-parser");
const routes = require("./routes"); // Bạn cần có file routes/index.js
const swaggerDocs = require("./swagger"); // Bạn cần có file swagger.js

dotenv.config(); // Load biến môi trường

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Nạp các route và Swagger
routes(app);
swaggerDocs(app);

// Kết nối MongoDB
mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
        console.log("✅ Connected to MongoDB");
        console.log(`📚 Swagger Docs available at http://localhost:${port}/api-docs`);
    })
    .catch((error) => {
        console.error("❌ MongoDB connection error:", error);
    });

// Khởi động server
app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
});
