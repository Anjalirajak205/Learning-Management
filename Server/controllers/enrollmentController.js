const mongoose = require("mongoose");

const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const Progress = require("../models/Progress");

// ENROLL IN COURSE


const enrollInCourse = async (req, res) => {
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

    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Only students can enroll in courses"
      });
    }

    const existingEnrollment = await Enrollment.findOne({
      student: req.user.id,
      course: courseId
    });

    if (existingEnrollment) {
      return res.status(400).json({
        message: "You are already enrolled in this course"
      });
    }

    const enrollment = await Enrollment.create({
      student: req.user.id,
      course: courseId
    });

   await Progress.create({
      student: req.user.id,
      course: courseId,
      completedLessons: [],
      percentage: 0
    });

    
    const populatedEnrollment = await Enrollment.findById(
      enrollment._id
    )
      .populate("student", "name email")
      .populate(
        "course",
        "title description thumbnail category level price"
      );

    res.status(201).json({
      message: "Successfully enrolled in course",
      enrollment: populatedEnrollment
    });

  } catch (error) {
    console.error("Enroll course error:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        message: "You are already enrolled in this course"
      });
    }

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};



// GET MY ENROLLED COURSES


const getMyEnrollments = async (req, res) => {
  try {

    // Only students
    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Only students can view enrolled courses"
      });
    }

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

    res.status(200).json({
      count: enrollments.length,
      enrollments
    });

  } catch (error) {
    console.error("Get enrollments error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// CHECK COURSE ENROLLMENT

const getCourseEnrollment = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Check course ID
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        message: "Invalid course ID"
      });
    }

    // Find enrollment
    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: courseId
    })
      .populate(
        "course",
        "title description thumbnail category level price instructor"
      );

    if (!enrollment) {
      return res.status(404).json({
        enrolled: false,
        message: "You are not enrolled in this course"
      });
    }

    res.status(200).json({
      enrolled: true,
      enrollment
    });

  } catch (error) {
    console.error("Check enrollment error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// CANCEL ENROLLMENT

const cancelEnrollment = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Check course ID
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        message: "Invalid course ID"
      });
    }

    // Only students
    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Only students can cancel enrollment"
      });
    }

    // Find enrollment
    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: courseId
    });

    if (!enrollment) {
      return res.status(404).json({
        message: "Enrollment not found"
      });
    }

    // Delete enrollment
    await Enrollment.findByIdAndDelete(
      enrollment._id
    );

    // Delete progress record
    await Progress.findOneAndDelete({
      student: req.user.id,
      course: courseId
    });

    res.status(200).json({
      message: "Enrollment cancelled successfully"
    });

  } catch (error) {
    console.error("Cancel enrollment error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// EXPORT


module.exports = {
  enrollInCourse,
  getMyEnrollments,
  getCourseEnrollment,
  cancelEnrollment
};