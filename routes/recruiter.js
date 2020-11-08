const express=require("express");
const recruiter=express.Router();

//Route Recruiter
recruiter.get("/",(req,res)=>{
  res.redirect("recruiter/dashboard");
});

//Recruiter Home
recruiter.get("/dashboard",(req,res)=>{
  res.render("recruiter/dashboard");
});

//View company details
recruiter.get("/details",(req,res)=>{
  res.render("recruiter/details");
});

//Edit company details
recruiter.get("/details/update",(req,res)=>{
  res.render("recruiter/edit-details");
});

//Add Jobs/Internships
recruiter.get("/recruitments/add",(req,res)=>{
  res.render("recruiter/add-recruitments");
});

//Add MCQ for jobs/internships
recruiter.get("/recruitments/:job/add/mcq",(req,res)=>{
  var job=process.params.job;
  res.render("recruiter/add-mcq",{
    job
  });
});

//View Students applied for drive
recruiter.get("/recruitments/:job/applied",(req,res)=>{
  var job=process.params.job;
  res.render("recruiter/applied-students",{
    job
  });
});

module.exports=recruiter;
