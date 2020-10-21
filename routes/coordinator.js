const express=require("express");
const coordinator=express.Router();

//Route Coordinator
coordinator.get("/",(req,res)=>{
  res.redirect("coordinator/dashboard");
});

//Coordinator Home
coordinator.get("/dashboard",(req,res)=>{
  res.render("coordinator/coordinator");
});

//Send Messages / Mail / Notification
coordinator.get("/message/add",(req,res)=>{
  res.render("coordinator/send-messages");
});

//Add example MCQ
coordinator.get("/practice/mcq/add",(req,res)=>{
  res.render("coordinator/add-mcq");
});

//Add statistics (eg: Externally placed student data)
coordinator.get("/statistics/add",(req,res)=>{
  res.render("coordinator/add-statistics");
});

//Schedule Interview, Training Sessions
coordinator.get("/schedule",(req,res)=>{
  res.render("coordinator/schedule");
});

//Alumni data
coordinator.get("/alumni",(req,res)=>{
  res.render("alumni");
});

//All Courses
coordinator.get("/course",(req,res)=>{
  res.render("coordinator/courses");
});

//View specific Course
coordinator.get("/course/:department/:semester/:course",(req,res)=>{
  var department=process.params.department;
  var semester=process.params.semester;
  var course=process.params.course;
  res.render("coordinator/view-course",{
    department,
    semester,
    course
  });
});

//Edit Course
coordinator.get("/course/:department/:semester/:course/edit",(req,res)=>{
  var department=process.params.department;
  var semester=process.params.semester;
  var course=process.params.course;
  res.render("coordinator/edit-course",{
    department,
    semester,
    course
  });
});

//View Help/Messages by Student
coordinator.get("/messages/",(req,res)=>{
  res.render("coordinator/messages");
});

//Manage Gallery
coordinator.get("/gallery/edit",(req,res)=>{
  res.render("coordinator/manage-gallery");
});

module.exports=coordinator;
