const Enrollment = require("../models/Enrollment");
const Progress = require("../models/Progress");
const QuizAttempt = require("../models/QuizAttempt");
const Lesson = require("../models/Lessons");
const User = require("../models/User");

// GET STUDENT DASHBOARD

const getStudentDashboard = async (req, res) => {
  try {
    
    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Only students can access student dashboard"
      });
    }

    const student = await User.findById(req.user.id)
      .select("-password");

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    // GET ENROLLED COURSES
    
    const enrollments = await Enrollment.find({
      student: req.user.id
    })
      .populate(
        "course",
        "title description thumbnail category level price instructor"
      )
      .sort({
        createdAt: -1
      });

    // GET PROGRESS
   
    const progressRecords = await Progress.find({
      student: req.user.id
    })
      .populate(
        "course",
        "title thumbnail category level"
      )
      .populate(
        "completedLessons",
        "title lessonOrder duration"
      );

    const progressMap = {};

    progressRecords.forEach((progress) => {
      if (progress.course) {
        progressMap[
          progress.course._id.toString()
        ] = progress;
      }
    });

    // COURSE DATA
       const enrolledCourses = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = enrollment.course;

        if (!course) {
          return null;
        }

        const courseId = course._id.toString();

        const progress = progressMap[courseId];

        const totalLessons =
          await Lesson.countDocuments({
            course: course._id
          });

        const completedLessons =
          progress
            ? progress.completedLessons.length
            : 0;

        let percentage = 0;

        if (totalLessons > 0) {
          percentage = Math.round(
            (completedLessons / totalLessons) * 100
          );
        }

        return {
          enrollmentId: enrollment._id,
          enrolledAt: enrollment.enrolledAt,

          course: {
            id: course._id,
            title: course.title,
            description: course.description,
            thumbnail: course.thumbnail,
            category: course.category,
            level: course.level,
            price: course.price
          },

          progress: {
            totalLessons,
            completedLessons,
            percentage
          },

          completedLessonList:
            progress
              ? progress.completedLessons
              : []
        };
      })
    );

    const validCourses = enrolledCourses.filter(
      (course) => course !== null
    );

    // GET QUIZ ATTEMPTS

    const quizAttempts = await QuizAttempt.find({
      student: req.user.id
    })
      .populate(
        "quiz",
        "title description course"
      )
      .sort({
        attemptedAt: -1
      });

    const attempts = quizAttempts.map(
      (attempt) => {
        let percentage = 0;

        if (attempt.totalQuestions > 0) {
          percentage = Math.round(
            (attempt.score /
              attempt.totalQuestions) *
              100
          );
        }

        return {
          id: attempt._id,

          quiz: attempt.quiz,

          score: attempt.score,

          totalQuestions:
            attempt.totalQuestions,

          percentage,

          attemptedAt:
            attempt.attemptedAt
        };
      }
    );

    // QUIZ STATISTICS
    const totalQuizAttempts =
      attempts.length;

    let averageQuizScore = 0;

    if (totalQuizAttempts > 0) {
      const totalPercentage =
        attempts.reduce(
          (sum, attempt) =>
            sum + attempt.percentage,
          0
        );

      averageQuizScore = Math.round(
        totalPercentage /
          totalQuizAttempts
      );
    }

    // COURSE STATISTICS
  
    const totalEnrolledCourses =
      validCourses.length;

    const completedCourses =
      validCourses.filter(
        (course) =>
          course.progress.percentage === 100
      ).length;

    const inProgressCourses =
      validCourses.filter(
        (course) =>
          course.progress.percentage > 0 &&
          course.progress.percentage < 100
      ).length;

    const notStartedCourses =
      validCourses.filter(
        (course) =>
          course.progress.percentage === 0
      ).length;

    // RECENT QUIZ ATTEMPTS
    
    const recentAttempts =
      attempts.slice(0, 5);

    // FINAL RESPONSE
   
    res.status(200).json({
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        role: student.role,
        profileImage: student.profileImage
      },

      statistics: {
        totalEnrolledCourses,
        completedCourses,
        inProgressCourses,
        notStartedCourses,
        totalQuizAttempts,
        averageQuizScore
      },

      enrolledCourses: validCourses,

      quizAttempts: attempts,

      recentQuizAttempts: recentAttempts
    });
  } catch (error) {
    console.error(
      "Get student dashboard error:",
      error
    );

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

module.exports = {
  getStudentDashboard
};