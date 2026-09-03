const mongoose = require("mongoose");

const Quiz = require("../models/Quiz");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

// CREATE QUIZ

const createQuiz = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, questions } = req.body;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        message: "Invalid course ID"
      });
    }

    if (!title || title.trim() === "") {
      return res.status(400).json({
        message: "Quiz title is required"
      });
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        message: "At least one question is required"
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        message: "Course not found"
      });
    }

    if (
      req.user.role !== "admin" &&
      course.instructor.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: "You are not allowed to create a quiz for this course"
      });
    }

    for (const question of questions) {
      if (!question.question || question.question.trim() === "") {
        return res.status(400).json({
          message: "Every question must have question text"
        });
      }

      if (
        !question.options ||
        !Array.isArray(question.options) ||
        question.options.length < 2
      ) {
        return res.status(400).json({
          message: "Each question must have at least 2 options"
        });
      }

      if (!question.correctAnswer) {
        return res.status(400).json({
          message: "Every question must have a correct answer"
        });
      }

      if (!question.options.includes(question.correctAnswer)) {
        return res.status(400).json({
          message:
            "Correct answer must match one of the question options"
        });
      }
    }

    const quiz = await Quiz.create({
      course: courseId,
      title: title.trim(),
      description: description || "",
      questions
    });

    res.status(201).json({
      message: "Quiz created successfully",
      quiz
    });
  } catch (error) {
    console.error("Create quiz error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// GET ALL QUIZZES OF A COURSE

const getCourseQuizzes = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        message: "Invalid course ID"
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        message: "Course not found"
      });
    }

    if (req.user.role === "student") {
      const enrollment = await Enrollment.findOne({
        student: req.user.id,
        course: courseId
      });

      if (!enrollment) {
        return res.status(403).json({
          message: "You are not enrolled in this course"
        });
      }
    }

    const quizzes = await Quiz.find({
      course: courseId
    }).sort({
      createdAt: -1
    });

    if (req.user.role === "student") {
      const safeQuizzes = quizzes.map((quiz) => {
        const quizObject = quiz.toObject();

        quizObject.questions = quizObject.questions.map(
          (question) => {
            delete question.correctAnswer;

            return question;
          }
        );

        return quizObject;
      });

      return res.status(200).json({
        count: safeQuizzes.length,
        quizzes: safeQuizzes
      });
    }

    res.status(200).json({
      count: quizzes.length,
      quizzes
    });
  } catch (error) {
    console.error("Get course quizzes error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// GET SINGLE QUIZ

const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid quiz ID"
      });
    }

    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found"
      });
    }

    if (req.user.role === "student") {
      const enrollment = await Enrollment.findOne({
        student: req.user.id,
        course: quiz.course
      });

      if (!enrollment) {
        return res.status(403).json({
          message: "You are not enrolled in this course"
        });
      }

      const quizObject = quiz.toObject();

      quizObject.questions = quizObject.questions.map(
        (question) => {
          delete question.correctAnswer;

          return question;
        }
      );

      return res.status(200).json({
        quiz: quizObject
      });
    }

    res.status(200).json({
      quiz
    });
  } catch (error) {
    console.error("Get quiz error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// UPDATE QUIZ

const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, questions } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid quiz ID"
      });
    }

    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found"
      });
    }

    const course = await Course.findById(quiz.course);

    if (!course) {
      return res.status(404).json({
        message: "Course not found"
      });
    }

    if (
      req.user.role !== "admin" &&
      course.instructor.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: "You are not allowed to update this quiz"
      });
    }

    if (title !== undefined) {
      if (title.trim() === "") {
        return res.status(400).json({
          message: "Quiz title cannot be empty"
        });
      }

      quiz.title = title.trim();
    }

    if (description !== undefined) {
      quiz.description = description;
    }

    if (questions !== undefined) {
      if (!Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({
          message: "At least one question is required"
        });
      }

      for (const question of questions) {
        if (!question.question || question.question.trim() === "") {
          return res.status(400).json({
            message: "Every question must have question text"
          });
        }

        if (
          !question.options ||
          !Array.isArray(question.options) ||
          question.options.length < 2
        ) {
          return res.status(400).json({
            message: "Each question must have at least 2 options"
          });
        }

        if (!question.correctAnswer) {
          return res.status(400).json({
            message: "Every question must have a correct answer"
          });
        }

        if (!question.options.includes(question.correctAnswer)) {
          return res.status(400).json({
            message:
              "Correct answer must match one of the question options"
          });
        }
      }

      quiz.questions = questions;
    }

    await quiz.save();

    res.status(200).json({
      message: "Quiz updated successfully",
      quiz
    });
  } catch (error) {
    console.error("Update quiz error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// DELETE QUIZ

const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid quiz ID"
      });
    }

    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found"
      });
    }

    const course = await Course.findById(quiz.course);

    if (!course) {
      return res.status(404).json({
        message: "Course not found"
      });
    }

    if (
      req.user.role !== "admin" &&
      course.instructor.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: "You are not allowed to delete this quiz"
      });
    }

    await Quiz.findByIdAndDelete(id);

    res.status(200).json({
      message: "Quiz deleted successfully"
    });
  } catch (error) {
    console.error("Delete quiz error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

module.exports = {
  createQuiz,
  getCourseQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz
};