const express=require("express");
const administrator=express.Router();

//Route Administrator
administrator.get("/",(req,res)=>{
  res.redirect("administrator/dashboard");
});

//Administrator Home
administrator.get("/dashboard",(req,res)=>{
  res.render("administrator/administrator");
});

//Manage Students
administrator.get("/students/modify",(req,res)=>{
  res.render("administrator/manage-students");
});

//Alumni data
administrator.get("/alumni",(req,res)=>{
  res.render("alumni");
});

//configurations
administrator.get("/configurations",(req,res)=>{
  res.render("administrator/configurations");
});

//Dump data
administrator.get("/dump/data",(req,res)=>{
  res.render("administrator/dump-data");
});

//Manage Coordinators
administrator.get("/coordinators/modify",(req,res)=>{
  res.render("administrator/manage-coordinators");
});

//Report Generation
administrator.get("/report/generate",(req,res)=>{
  res.render("administrator/generate-report");
});

module.exports=administrator;
