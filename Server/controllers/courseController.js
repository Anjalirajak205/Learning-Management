const Course = require("../models/Course");


// CREATE COURSE


const createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      thumbnail,
      category,
      level,
      price,
      published
    } = req.body;

    
    if (!title || !description || !category) {
      return res.status(400).json({
        message: "Title, description and category are required"
      });
    }

    
    const course = await Course.create({
      title,
      description,
      thumbnail: thumbnail || "",
      instructor: req.user.id,
      category,
      level: level || "Beginner",
      price: price || 0,
      published: published || false
    });

    res.status(201).json({
      message: "Course created successfully",
      course
    });

  } catch (error) {
    console.error("Create Course Error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};



// GET ALL COURSES


const getAllCourses = async (req, res) => {
  try {

    const courses = await Course.find()
      .populate("instructor", "name email profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Courses fetched successfully",
      count: courses.length,
      courses
    });

  } catch (error) {
    console.error("Get Courses Error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};



// GET SINGLE COURSE

const getCourseById = async (req, res) => {
  try {

    const course = await Course.findById(req.params.id)
      .populate("instructor", "name email profileImage");

    if (!course) {
      return res.status(404).json({
        message: "Course not found"
      });
    }

    res.status(200).json({
      message: "Course fetched successfully",
      course
    });

  } catch (error) {
    console.error("Get Course Error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};


// UPDATE COURSE


const updateCourse = async (req, res) => {
  try {

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        message: "Course not found"
      });
    }

    if (
      course.instructor.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "You are not allowed to update this course"
      });
    }

    const {
      title,
      description,
      thumbnail,
      category,
      level,
      price,
      published
    } = req.body;

    course.title = title ?? course.title;
    course.description = description ?? course.description;
    course.thumbnail = thumbnail ?? course.thumbnail;
    course.category = category ?? course.category;
    course.level = level ?? course.level;
    course.price = price ?? course.price;
    course.published = published ?? course.published;

    const updatedCourse = await course.save();

    res.status(200).json({
      message: "Course updated successfully",
      course: updatedCourse
    });

  } catch (error) {
    console.error("Update Course Error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// DELETE COURSE


const deleteCourse = async (req, res) => {
  try {

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        message: "Course not found"
      });
    }

    
    if (
      course.instructor.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "You are not allowed to delete this course"
      });
    }

    await Course.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Course deleted successfully"
    });

  } catch (error) {
    console.error("Delete Course Error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// GET MY COURSES


const getMyCourses = async (req, res) => {
  try {

    const courses = await Course.find({
      instructor: req.user.id
    }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Your courses fetched successfully",
      count: courses.length,
      courses
    });

  } catch (error) {
    console.error("My Courses Error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};


module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getMyCourses
};