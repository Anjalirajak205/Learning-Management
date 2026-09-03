const express = require("express");

const {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getMyCourses
} = require("../controllers/courseController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();


// ======================================
// GET ALL COURSES
// Public route
// ======================================

router.get("/", getAllCourses);


// ======================================
// GET MY COURSES
// Instructor/Admin
// ======================================

router.get(
  "/my-courses",
  protect,
  authorize("instructor", "admin"),
  getMyCourses
);


// ======================================
// GET SINGLE COURSE
// Public route
// ======================================

router.get("/:id", getCourseById);


// ======================================
// CREATE COURSE
// Instructor/Admin
// ======================================

router.post(
  "/",
  protect,
  authorize("instructor", "admin"),
  createCourse
);


// ======================================
// UPDATE COURSE
// Instructor/Admin
// ======================================

router.put(
  "/:id",
  protect,
  authorize("instructor", "admin"),
  updateCourse
);


// ======================================
// DELETE COURSE
// Instructor/Admin
// ======================================

router.delete(
  "/:id",
  protect,
  authorize("instructor", "admin"),
  deleteCourse
);


module.exports = router;