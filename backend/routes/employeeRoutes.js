const express = require("express");
const mongoose = require("mongoose");
const Employee = require("../models/Employee");

const router = express.Router();

// Tim nhan vien theo MongoDB ID hoac ma nhan vien
async function findEmployee(id) {
  if (mongoose.isValidObjectId(id)) {
    const employee = await Employee.findById(id);
    if (employee) return employee;
  }

  return Employee.findOne({ employeeId: id });
}

// GET: Lay danh sach va tim kiem nhan vien
router.get("/", async (req, res) => {
  try {
    const search = req.query.search?.trim();
    const filter = {};

    if (search) {
      const keyword = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter.$or = [
        { employeeId: { $regex: keyword, $options: "i" } },
        { fullName: { $regex: keyword, $options: "i" } }
      ];
    }

    const employees = await Employee.find(filter).sort({ createdAt: -1 });
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: "Loi lay danh sach nhan vien" });
  }
});

// GET: Lay mot nhan vien
router.get("/:id", async (req, res) => {
  try {
    const employee = await findEmployee(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: "Khong tim thay nhan vien" });
    }

    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: "Loi lay thong tin nhan vien" });
  }
});

// POST: Them nhan vien
router.post("/", async (req, res) => {
  try {
    const { employeeId, fullName, email } = req.body;

    if (
      typeof employeeId !== "string" || !employeeId.trim() ||
      typeof fullName !== "string" || !fullName.trim() ||
      typeof email !== "string" || !email.trim()
    ) {
      return res.status(400).json({
        message: "Ma nhan vien, ho ten va email la bat buoc"
      });
    }

    const employee = await Employee.create(req.body);

    res.status(201).json({
      message: "Them nhan vien thanh cong",
      employee
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Ma nhan vien da ton tai"
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Loi them nhan vien" });
  }
});

// PUT: Cap nhat nhan vien
router.put("/:id", async (req, res) => {
  try {
    const employee = await findEmployee(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: "Khong tim thay nhan vien" });
    }

    const allowedFields = [
      "employeeId", "fullName", "gender", "dateOfBirth",
      "department", "position", "email", "phone", "hireDate", "status"
    ];

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        employee.set(field, req.body[field]);
      }
    }

    await employee.save();

    res.status(200).json({
      message: "Cap nhat nhan vien thanh cong",
      employee
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Ma nhan vien da ton tai"
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Loi cap nhat nhan vien" });
  }
});

// DELETE: Xoa nhan vien
router.delete("/:id", async (req, res) => {
  try {
    const employee = await findEmployee(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: "Khong tim thay nhan vien" });
    }

    await employee.deleteOne();

    res.status(200).json({ message: "Xoa nhan vien thanh cong" });
  } catch (error) {
    res.status(500).json({ message: "Loi xoa nhan vien" });
  }
});

module.exports = router;
