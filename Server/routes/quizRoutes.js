const express = require("express");

const {
  createQuiz,
  getCourseQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz
} = require("../controllers/quizController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/course/:courseId",
  protect,
  getCourseQuizzes
);

router.post(
  "/course/:courseId",
  protect,
  authorize("instructor", "admin"),
  createQuiz
);

router.get(
  "/:id",
  protect,
  getQuizById
);

router.put(
  "/:id",
  protect,
  authorize("instructor", "admin"),
  updateQuiz
);

router.delete(
  "/:id",
  protect,
  authorize("instructor", "admin"),
  deleteQuiz
);

module.exports = router;