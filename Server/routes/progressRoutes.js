const express = require("express");

const {
  getCourseProgress,
  markLessonComplete,
  markLessonIncomplete,
  getMyProgress
} = require("../controllers/progressController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// GET ALL MY PROGRESS

router.get(
  "/my-progress",
  protect,
  getMyProgress
);

// GET PROGRESS OF PARTICULAR COURSE

router.get(
  "/:courseId",
  protect,
  getCourseProgress
);

// MARK LESSON COMPLETE

router.put(
  "/:courseId/lesson/:lessonId/complete",
  protect,
  markLessonComplete
);

// MARK LESSON INCOMPLETE

router.put(
  "/:courseId/lesson/:lessonId/incomplete",
  protect,
  markLessonIncomplete
);


module.exports = router;