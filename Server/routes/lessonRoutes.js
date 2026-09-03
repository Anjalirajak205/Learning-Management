const express = require("express");

const {
  createLesson,
  getCourseLessons,
  getLessonById,
  updateLesson,
  deleteLesson
} = require("../controllers/lessonController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();


// =====================================================
// COURSE LESSON ROUTES
// =====================================================

// Create lesson
router.post(
  "/course/:courseId",
  protect,
  authorize("instructor", "admin"),
  createLesson
);

// Get all lessons of a course
router.get(
  "/course/:courseId",
  getCourseLessons
);


// =====================================================
// SINGLE LESSON ROUTES
// =====================================================

// Get single lesson
router.get(
  "/:id",
  getLessonById
);

// Update lesson
router.put(
  "/:id",
  protect,
  authorize("instructor", "admin"),
  updateLesson
);

// Delete lesson
router.delete(
  "/:id",
  protect,
  authorize("instructor", "admin"),
  deleteLesson
);


module.exports = router;