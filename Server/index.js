const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = rquire("./config/db.js");

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.get("/",(req,res)=>{
    res.json({
        message:"LearnHub LMS API is running"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log("Server running on port ${PORT}");
});