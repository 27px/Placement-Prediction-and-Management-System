const {version}=require("../package.json");
const express=require("express");
const student=express.Router();

//Route Student
student.get("/",(req,res)=>{
  res.redirect("/student/dashboard");
});

//Student Dashboard
student.get("/dashboard",(req,res)=>{
  res.render("student/student",{
    version
  });
});

//Student Settings
student.get("/settings",(req,res)=>{
  res.render("student/settings");
});

//Profile
student.get("/profile",(req,res)=>{
  res.render("student/profile");
});

//Profile of others or current user
student.get("/profile/:id",(req,res)=>{
  var user=req.params.id;
  res.render("student/view-profile",{
    user
  });
});

//Edit Profile
student.get("/profile/edit",(req,res)=>{
  res.render("student/edit-profile");
});

//View all Drives
student.get("/drive",(req,res)=>{
  res.render("student/view-drives");
});

//View Specific Drive
student.get("/drive/:drive",(req,res)=>{
  var drive=req.params.drive;
  res.render("student/drive",{
    drive
  });
});

//Apply for Specific Drive
student.get("/drive/:drive/apply",(req,res)=>{
  var drive=req.params.drive;
  res.render("student/apply-for-drive",{
    drive
  });
});

//participate in drive
student.get("/drive/:drive/round/:round",(req,res)=>{
  var drive=req.params.drive;
  var round=req.params.round;
  res.render("student/participate-in-drive",{
    drive,
    round
  });
});

//skill tracking
student.get("/skills/tracking",(req,res)=>{
  res.render("student/skill-tracker");
});

//external jobs via api
student.get("/external",(req,res)=>{
  res.render("student/external-jobs");
});

module.exports=student;
