const express = require("express");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes.js");
const courseRoutes = require("./routes/courseRoutes.js");
const lessonRoutes = require("./routes/lessonRoutes.js");
const enrollmentRoutes = require("./routes/enrollmentRoutes.js");

const connectDB = require("./config/db.js");


const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.get("/",(req,res)=>{
    res.json({
        message:"LearnHub LMS API is running"
    });
});
app.use("/api/auth", authRoutes);
app.use("/api/course",courseRoutes);
app.use("/api/lessons",lessonRoutes);
app.use("/api/enrollment",enrollmentRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log("Server running on port ${PORT}");
});