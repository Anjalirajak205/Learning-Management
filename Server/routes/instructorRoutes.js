const express = require("express");

const {
  getInstructorDashboard
} = require("../controllers/instructorController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/dashboard",
  protect,
  authorize("instructor", "admin"),
  getInstructorDashboard
);

module.exports = router;