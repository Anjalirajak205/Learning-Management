const Course = require("../models/Course");
const Lesson = require("../models/Lessons");
const Enrollment = require("../models/Enrollment");
const Quiz = require("../models/Quiz");
const QuizAttempt = require("../models/QuizAttempt");

// GET INSTRUCTOR DASHBOARD
const getInstructorDashboard = async (req, res) => {
  try {
    // Only instructor/admin can access
    if (req.user.role !== "instructor" && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Instructor only."
      });
    }

    // 1. Get courses created by instructor

    const courseFilter =
      req.user.role === "admin"
        ? {}
        : { instructor: req.user.id };

    const courses = await Course.find(courseFilter)
      .populate("instructor", "name email")
      .sort({ createdAt: -1 });

    // 2. Course IDs
    const courseIds = courses.map((course) => course._id);

    // 3. Get lessons
    const lessons = await Lesson.find({
      course: { $in: courseIds }
    });

    // 4. Get enrollments
    const enrollments = await Enrollment.find({
      course: { $in: courseIds }
    }).populate("student", "name email");

    // 5. Get quizzes
    const quizzes = await Quiz.find({
      course: { $in: courseIds }
    });

    // 6. Get quiz attempts
    const quizIds = quizzes.map((quiz) => quiz._id);

    const quizAttempts = await QuizAttempt.find({
      quiz: { $in: quizIds }
    }).populate("student", "name email");

    // DASHBOARD STATISTICS
    const totalCourses = courses.length;

    const publishedCourses = courses.filter(
      (course) => course.published === true
    ).length;

    const unpublishedCourses = courses.filter(
      (course) => course.published === false
    ).length;

    const totalLessons = lessons.length;

    const totalEnrollments = enrollments.length;

    const totalQuizzes = quizzes.length;

    const totalQuizAttempts = quizAttempts.length;

    // COURSE-WISE DATA
   const courseStatistics = courses.map((course) => {
      const courseEnrollments = enrollments.filter(
        (enrollment) =>
          enrollment.course.toString() === course._id.toString()
      );

      const courseLessons = lessons.filter(
        (lesson) =>
          lesson.course.toString() === course._id.toString()
      );

      const courseQuizzes = quizzes.filter(
        (quiz) =>
          quiz.course.toString() === course._id.toString()
      );

      const courseQuizIds = courseQuizzes.map((quiz) =>
        quiz._id.toString()
      );

      const courseAttempts = quizAttempts.filter((attempt) =>
        courseQuizIds.includes(attempt.quiz.toString())
      );

      return {
        courseId: course._id,
        title: course.title,
        description: course.description,
        thumbnail: course.thumbnail,
        category: course.category,
        level: course.level,
        price: course.price,
        published: course.published,

        totalLessons: courseLessons.length,

        totalStudents: courseEnrollments.length,

        totalQuizzes: courseQuizzes.length,

        totalQuizAttempts: courseAttempts.length
      };
    });

    // RECENT COURSES

    const recentCourses = courses.slice(0, 5).map((course) => {
      return {
        id: course._id,
        title: course.title,
        category: course.category,
        level: course.level,
        published: course.published,
        createdAt: course.createdAt
      };
    });

    // RECENT ENROLLMENTS

const recentEnrollments = enrollments
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((enrollment) => {
        const course = courses.find(
          (item) =>
            item._id.toString() === enrollment.course.toString()
        );

        return {
          id: enrollment._id,
          student: enrollment.student,
          course: course
            ? {
                id: course._id,
                title: course.title
              }
            : null,
          enrolledAt: enrollment.enrolledAt
        };
      });

    // RESPONSE

    res.status(200).json({
      instructor: {
        id: req.user.id,
        role: req.user.role
      },

      statistics: {
        totalCourses,
        publishedCourses,
        unpublishedCourses,
        totalLessons,
        totalStudents: totalEnrollments,
        totalQuizzes,
        totalQuizAttempts
      },

      courseStatistics,

      recentCourses,

      recentEnrollments
    });
  } catch (error) {
    console.error("Instructor dashboard error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

module.exports = {
  getInstructorDashboard
};