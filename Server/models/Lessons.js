const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      default: ""
    },

    videoUrl: {
      type: String,
      default: ""
    },

    documentUrl: {
      type: String,
      default: ""
    },

    lessonOrder: {
      type: Number,
      default: 1
    },

    duration: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const Lesson = mongoose.model("Lesson", lessonSchema);

module.exports = Lesson;