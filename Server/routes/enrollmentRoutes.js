const express = require("express");

const {
  enrollInCourse,
  getMyEnrollments,
  getCourseEnrollment,
  cancelEnrollment
} = require("../controllers/enrollmentController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// =====================================================
// ENROLL IN COURSE
// =====================================================

router.post(
  "/:courseId",
  protect,
  enrollInCourse
);


// =====================================================
// GET MY ENROLLED COURSES
// =====================================================

router.get(
  "/my-courses",
  protect,
  getMyEnrollments
);


// =====================================================
// CHECK COURSE ENROLLMENT
// =====================================================

router.get(
  "/:courseId",
  protect,
  getCourseEnrollment
);


// =====================================================
// CANCEL ENROLLMENT
// =====================================================

router.delete(
  "/:courseId",
  protect,
  cancelEnrollment
);


module.exports = router;