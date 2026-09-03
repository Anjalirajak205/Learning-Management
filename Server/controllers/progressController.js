const mongoose = require("mongoose");

const Progress = require("../models/Progress");
const Course = require("../models/Course");
const Lesson = require("../models/Lessons");
const Enrollment = require("../models/Enrollment");

// GET COURSE PROGRESS

const getCourseProgress = async (req, res) => {
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

    
    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: courseId
    });

    if (!enrollment) {
      return res.status(403).json({
        message: "You are not enrolled in this course"
      });
    }

    let progress = await Progress.findOne({
      student: req.user.id,
      course: courseId
    }).populate(
      "completedLessons",
      "title description lessonOrder duration"
    );

    if (!progress) {
      progress = await Progress.create({
        student: req.user.id,
        course: courseId,
        completedLessons: [],
        percentage: 0
      });
    }

    const totalLessons = await Lesson.countDocuments({
      course: courseId
    });

    const completedLessons = progress.completedLessons.length;

    let percentage = 0;

    if (totalLessons > 0) {
      percentage = Math.round(
        (completedLessons / totalLessons) * 100
      );
    }

    // Update percentage in database
    progress.percentage = percentage;

    await progress.save();

    res.status(200).json({
      course: {
        id: course._id,
        title: course.title
      },
      totalLessons,
      completedLessons,
      percentage,
      progress
    });

  } catch (error) {
    console.error("Get course progress error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// MARK LESSON AS COMPLETE

const markLessonComplete = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        message: "Invalid course ID"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(400).json({
        message: "Invalid lesson ID"
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        message: "Course not found"
      });
    }
    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
      return res.status(404).json({
        message: "Lesson not found"
      });
    }

    if (lesson.course.toString() !== courseId) {
      return res.status(400).json({
        message: "This lesson does not belong to this course"
      });
    }

   const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: courseId
    });

    if (!enrollment) {
      return res.status(403).json({
        message: "You are not enrolled in this course"
      });
    }

    let progress = await Progress.findOne({
      student: req.user.id,
      course: courseId
    });

    if (!progress) {
      progress = await Progress.create({
        student: req.user.id,
        course: courseId,
        completedLessons: [],
        percentage: 0
      });
    }
    const alreadyCompleted =
      progress.completedLessons.some(
        (id) => id.toString() === lessonId
      );

    if (alreadyCompleted) {
      return res.status(400).json({
        message: "Lesson is already completed",
        percentage: progress.percentage
      });
    }

    progress.completedLessons.push(lessonId);

   const totalLessons = await Lesson.countDocuments({
      course: courseId
    });

    const completedLessons =
      progress.completedLessons.length;

    let percentage = 0;

    if (totalLessons > 0) {
      percentage = Math.round(
        (completedLessons / totalLessons) * 100
      );
    }

    progress.percentage = percentage;

    await progress.save();

    res.status(200).json({
      message: "Lesson marked as completed",
      lesson: {
        id: lesson._id,
        title: lesson.title
      },
      totalLessons,
      completedLessons,
      percentage,
      progress
    });

  } catch (error) {
    console.error("Mark lesson complete error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// MARK LESSON AS INCOMPLETE

const markLessonIncomplete = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;

     if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        message: "Invalid course ID"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(400).json({
        message: "Invalid lesson ID"
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        message: "Course not found"
      });
    }

    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
      return res.status(404).json({
        message: "Lesson not found"
      });
    }

    if (lesson.course.toString() !== courseId) {
      return res.status(400).json({
        message: "This lesson does not belong to this course"
      });
    }

    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: courseId
    });

    if (!enrollment) {
      return res.status(403).json({
        message: "You are not enrolled in this course"
      });
    }

    const progress = await Progress.findOne({
      student: req.user.id,
      course: courseId
    });

    if (!progress) {
      return res.status(404).json({
        message: "Progress record not found"
      });
    }

   const lessonCompleted =
      progress.completedLessons.some(
        (id) => id.toString() === lessonId
      );

    if (!lessonCompleted) {
      return res.status(400).json({
        message: "Lesson is not completed"
      });
    }

    progress.completedLessons =
      progress.completedLessons.filter(
        (id) => id.toString() !== lessonId
      );

    const totalLessons = await Lesson.countDocuments({
      course: courseId
    });

    const completedLessons =
      progress.completedLessons.length;

    let percentage = 0;

    if (totalLessons > 0) {
      percentage = Math.round(
        (completedLessons / totalLessons) * 100
      );
    }

    progress.percentage = percentage;

    await progress.save();

    res.status(200).json({
      message: "Lesson marked as incomplete",
      lesson: {
        id: lesson._id,
        title: lesson.title
      },
      totalLessons,
      completedLessons,
      percentage,
      progress
    });

  } catch (error) {
    console.error("Mark lesson incomplete error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// GET ALL MY PROGRESS

const getMyProgress = async (req, res) => {
  try {
    // Get all progress records
    const progressRecords = await Progress.find({
      student: req.user.id
    })
      .populate(
        "course",
        "title description thumbnail category level"
      )
      .populate(
        "completedLessons",
        "title lessonOrder duration"
      )
      .sort({
        updatedAt: -1
      });

    
    const progressData = await Promise.all(
      progressRecords.map(async (progress) => {
        const totalLessons =
          await Lesson.countDocuments({
            course: progress.course._id
          });

        return {
          course: progress.course,
          totalLessons,
          completedLessons:
            progress.completedLessons.length,
          percentage: progress.percentage,
          completedLessonList:
            progress.completedLessons
        };
      })
    );

    res.status(200).json({
      count: progressData.length,
      progress: progressData
    });

  } catch (error) {
    console.error("Get my progress error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// EXPORT

module.exports = {
  getCourseProgress,
  markLessonComplete,
  markLessonIncomplete,
  getMyProgress
};