const express = require("express");

const {
  submitQuiz,
  getAttemptResult,
  getMyAttempts,
  getQuizAttempts
} = require("../controllers/quizAttemptController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/quiz/:quizId/submit",
  protect,
  submitQuiz
);

router.get(
  "/my-attempts",
  protect,
  getMyAttempts
);

router.get(
  "/:attemptId",
  protect,
  getAttemptResult
);

router.get(
  "/quiz/:quizId",
  protect,
  getQuizAttempts
);

module.exports = router;