const {version}=require("../package.json");
const express=require("express");
const studentTabs=require("./student-tabs");
const student=express.Router();

//Route Student
student.get("/",(req,res)=>{
  res.redirect("/student/dashboard");
});

//Student Dashboard
student.get("/dashboard",(req,res)=>{
  res.render("student/dashboard",{
    tab:req.query.tab,
    version
  });
});

//Profile of others or current user
student.get("/profile/:id",(req,res)=>{
  var user=req.params.id;
  res.render("student/view-profile",{
    user
  });
});

//Student Dashboard Tabs
student.use("/dashboard",studentTabs);

module.exports=student;
