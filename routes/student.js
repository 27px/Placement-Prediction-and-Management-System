const {version}=require("../package.json");
const express=require("express");
const studentTabs=require("./student-tabs");
const student=express.Router();
const User=require("../functions/user.js");
const user=new User();

//Route Student
student.get("/",(req,res)=>{
  res.redirect("/student/dashboard");
});

//Student Dashboard
student.get("/dashboard",(req,res)=>{
  //use user class for checking login
  console.log(req.session.user,req.session.type);
  //student or coordinator
  if(req.session.user!==undefined && ( req.session.type==="student" || req.session.type==="coordinator" ))
  {
    res.render("student/dashboard",{
      tab:req.query.tab,
      version,
      usertype:user.type
    });
  }
  else if(req.session.user!==undefined && req.session.type!==undefined)//other users
  {
    res.redirect("/404");
  }
  else
  {
    res.redirect("/login");
  }
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
