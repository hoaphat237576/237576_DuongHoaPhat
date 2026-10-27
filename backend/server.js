require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const employeeRoutes = require("./routes/employeeRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Kiem tra trang thai Backend
app.get("/health", (req, res) => {
  res.status(200).json({
    message: "Backend is running",
    database: mongoose.connection.readyState === 1
      ? "connected"
      : "disconnected"
  });
});

// API nhan vien
app.use("/api/employees", employeeRoutes);

// Xu ly duong dan khong ton tai
app.use((req, res) => {
  res.status(404).json({ message: "API khong ton tai" });
});

// Ket noi MongoDB Atlas
async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("Chua cau hinh MONGODB_URI trong file .env");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Da ket noi MongoDB Atlas");

    app.listen(PORT, () => {
      console.log(`Backend dang chay tai cong ${PORT}`);
    });
  } catch (error) {
    console.error("Loi khoi dong Backend:", error.message);
    process.exit(1);
  }
}

startServer();
