const mongoose = require("mongoose");

const Quiz = require("../models/Quiz");
const QuizAttempt = require("../models/QuizAttempt");
const Enrollment = require("../models/Enrollment");

// SUBMIT QUIZ

const submitQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body;

    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Only students can submit quizzes"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({
        message: "Invalid quiz ID"
      });
    }

    if (!answers || typeof answers !== "object") {
      return res.status(400).json({
        message: "Answers are required"
      });
    }

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found"
      });
    }

    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: quiz.course
    });

    if (!enrollment) {
      return res.status(403).json({
        message: "You are not enrolled in this course"
      });
    }

    const totalQuestions = quiz.questions.length;

    if (totalQuestions === 0) {
      return res.status(400).json({
        message: "This quiz has no questions"
      });
    }

    let score = 0;

    quiz.questions.forEach((question) => {
      const selectedAnswer = answers[question._id.toString()];

      if (
        selectedAnswer !== undefined &&
        selectedAnswer === question.correctAnswer
      ) {
        score++;
      }
    });

    const percentage = Math.round(
      (score / totalQuestions) * 100
    );

    const attempt = await QuizAttempt.create({
      student: req.user.id,
      quiz: quizId,
      score: score,
      totalQuestions: totalQuestions
    });

    res.status(201).json({
      message: "Quiz submitted successfully",
      result: {
        attemptId: attempt._id,
        quiz: quiz.title,
        score,
        totalQuestions,
        percentage,
        attemptedAt: attempt.attemptedAt
      }
    });
  } catch (error) {
    console.error("Submit quiz error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// GET SINGLE ATTEMPT RESULT

const getAttemptResult = async (req, res) => {
  try {
    const { attemptId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(attemptId)) {
      return res.status(400).json({
        message: "Invalid attempt ID"
      });
    }

    const attempt = await QuizAttempt.findById(attemptId)
      .populate("student", "name email")
      .populate("quiz", "title description");

    if (!attempt) {
      return res.status(404).json({
        message: "Quiz attempt not found"
      });
    }

    if (
      req.user.role === "student" &&
      attempt.student._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: "You are not allowed to view this result"
      });
    }

    const percentage =
      attempt.totalQuestions > 0
        ? Math.round(
            (attempt.score / attempt.totalQuestions) * 100
          )
        : 0;

    res.status(200).json({
      attempt: {
        id: attempt._id,
        student: attempt.student,
        quiz: attempt.quiz,
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        percentage,
        attemptedAt: attempt.attemptedAt
      }
    });
  } catch (error) {
    console.error("Get attempt result error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// GET MY QUIZ ATTEMPTS

const getMyAttempts = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Only students can view their attempts"
      });
    }

    const attempts = await QuizAttempt.find({
      student: req.user.id
    })
      .populate(
        "quiz",
        "title description course"
      )
      .sort({
        attemptedAt: -1
      });

    const attemptsWithPercentage = attempts.map(
      (attempt) => {
        const percentage =
          attempt.totalQuestions > 0
            ? Math.round(
                (attempt.score /
                  attempt.totalQuestions) *
                  100
              )
            : 0;

        return {
          id: attempt._id,
          quiz: attempt.quiz,
          score: attempt.score,
          totalQuestions: attempt.totalQuestions,
          percentage,
          attemptedAt: attempt.attemptedAt
        };
      }
    );

    res.status(200).json({
      count: attemptsWithPercentage.length,
      attempts: attemptsWithPercentage
    });
  } catch (error) {
    console.error("Get my attempts error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// GET ALL ATTEMPTS FOR A QUIZ

const getQuizAttempts = async (req, res) => {
  try {
    const { quizId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({
        message: "Invalid quiz ID"
      });
    }
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found"
      });
    }

    const attempts = await QuizAttempt.find({
      quiz: quizId
    })
      .populate(
        "student",
        "name email"
      )
      .sort({
        attemptedAt: -1
      });

    if (req.user.role !== "admin") {
      const course = await mongoose.model("Course").findById(
        quiz.course
      );

      if (!course) {
        return res.status(404).json({
          message: "Course not found"
        });
      }

      if (
        course.instructor.toString() !== req.user.id
      ) {
        return res.status(403).json({
          message:
            "You are not allowed to view all quiz attempts"
        });
      }
    }

    const attemptsWithPercentage = attempts.map(
      (attempt) => {
        const percentage =
          attempt.totalQuestions > 0
            ? Math.round(
                (attempt.score /
                  attempt.totalQuestions) *
                  100
              )
            : 0;

        return {
          id: attempt._id,
          student: attempt.student,
          quiz: attempt.quiz,
          score: attempt.score,
          totalQuestions: attempt.totalQuestions,
          percentage,
          attemptedAt: attempt.attemptedAt
        };
      }
    );

    res.status(200).json({
      count: attemptsWithPercentage.length,
      attempts: attemptsWithPercentage
    });
  } catch (error) {
    console.error("Get quiz attempts error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

module.exports = {
  submitQuiz,
  getAttemptResult,
  getMyAttempts,
  getQuizAttempts
};