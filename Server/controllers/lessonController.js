const mongoose = require("mongoose");
const Lesson = require("../models/Lesson");
const Course = require("../models/Course");
const Progress = require("../models/Progress");


// CREATE LESSON
// POST /api/courses/:courseId/lessons


const createLesson = async (req, res) => {
  try {
    const { courseId } = req.params;

    const {
      title,
      description,
      videoUrl,
      documentUrl,
      lessonOrder,
      duration
    } = req.body;

    
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        message: "Invalid course ID"
      });
    }

   
    if (!title) {
      return res.status(400).json({
        message: "Lesson title is required"
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
        message: "You are not allowed to add lessons to this course"
      });
    }

  
    const lesson = await Lesson.create({
      course: courseId,
      title,
      description: description || "",
      videoUrl: videoUrl || "",
      documentUrl: documentUrl || "",
      lessonOrder: lessonOrder || 1,
      duration: duration || 0
    });

    res.status(201).json({
      message: "Lesson created successfully",
      lesson
    });
  } catch (error) {
    console.error("Create lesson error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};



// GET ALL LESSONS OF A COURSE
// GET /api/courses/:courseId/lessons


const getCourseLessons = async (req, res) => {
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

   
    const lessons = await Lesson.find({
      course: courseId
    }).sort({
      lessonOrder: 1
    });

    res.status(200).json({
      course: {
        id: course._id,
        title: course.title
      },
      count: lessons.length,
      lessons
    });
  } catch (error) {
    console.error("Get course lessons error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};



// GET SINGLE LESSON
// GET /api/lessons/:id


const getLessonById = async (req, res) => {
  try {
    const { id } = req.params;

    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid lesson ID"
      });
    }

    const lesson = await Lesson.findById(id).populate(
      "course",
      "title description instructor"
    );

    if (!lesson) {
      return res.status(404).json({
        message: "Lesson not found"
      });
    }

    res.status(200).json({
      lesson
    });
  } catch (error) {
    console.error("Get lesson error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};



// UPDATE LESSON
// PUT /api/lessons/:id


const updateLesson = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      videoUrl,
      documentUrl,
      lessonOrder,
      duration
    } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid lesson ID"
      });
    }

   
    const lesson = await Lesson.findById(id);

    if (!lesson) {
      return res.status(404).json({
        message: "Lesson not found"
      });
    }

    
    const course = await Course.findById(lesson.course);

    if (!course) {
      return res.status(404).json({
        message: "Course not found"
      });
    }

    // Check permission
    if (
      req.user.role !== "admin" &&
      course.instructor.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: "You are not allowed to update this lesson"
      });
    }

    // Update only provided fields
    if (title !== undefined) {
      lesson.title = title;
    }

    if (description !== undefined) {
      lesson.description = description;
    }

    if (videoUrl !== undefined) {
      lesson.videoUrl = videoUrl;
    }

    if (documentUrl !== undefined) {
      lesson.documentUrl = documentUrl;
    }

    if (lessonOrder !== undefined) {
      lesson.lessonOrder = lessonOrder;
    }

    if (duration !== undefined) {
      lesson.duration = duration;
    }

    await lesson.save();

    res.status(200).json({
      message: "Lesson updated successfully",
      lesson
    });
  } catch (error) {
    console.error("Update lesson error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};


// =====================================================
// DELETE LESSON
// DELETE /api/lessons/:id
// =====================================================

const deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;

    // Check lesson ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid lesson ID"
      });
    }

    // Find lesson
    const lesson = await Lesson.findById(id);

    if (!lesson) {
      return res.status(404).json({
        message: "Lesson not found"
      });
    }

    // Find course
    const course = await Course.findById(lesson.course);

    if (!course) {
      return res.status(404).json({
        message: "Course not found"
      });
    }

    // Check permission
    if (
      req.user.role !== "admin" &&
      course.instructor.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: "You are not allowed to delete this lesson"
      });
    }

    // Delete lesson
    await Lesson.findByIdAndDelete(id);

    // Remove deleted lesson from student progress
    await Progress.updateMany(
      {
        completedLessons: id
      },
      {
        $pull: {
          completedLessons: id
        }
      }
    );

    res.status(200).json({
      message: "Lesson deleted successfully"
    });
  } catch (error) {
    console.error("Delete lesson error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};


// =====================================================
// EXPORT CONTROLLERS
// =====================================================

module.exports = {
  createLesson,
  getCourseLessons,
  getLessonById,
  updateLesson,
  deleteLesson
};