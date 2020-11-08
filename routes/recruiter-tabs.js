const express=require("express");
const recruiterTabs=express.Router();

//Main Home tab in Dashboard of Recruiter
recruiterTabs.post("/main",(req,res)=>{
  res.render(`recruiter/dashboard-tabs/main`);
});

//Recruiter Settings
recruiterTabs.post("/options",(req,res)=>{
  res.render("recruiter/dashboard-tabs/settings");
});

module.exports=recruiterTabs;
