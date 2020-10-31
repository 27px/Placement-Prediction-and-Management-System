const express=require("express");
const studentTabs=express.Router();

//Main Home tab in Dashboard of Student
studentTabs.post("/main",(req,res)=>{
  res.render(`student/dashboard-tabs/main`);
});

//Student Settings
studentTabs.post("/settings",(req,res)=>{
  res.render("student/dashboard-tabs/settings");
});

//Student Profile
studentTabs.post("/profile",(req,res)=>{
  res.render(`student/dashboard-tabs/profile`);
});

//Edit Profile
studentTabs.post("/profile/edit",(req,res)=>{
  res.render("student/dashboard-tabs/edit-profile");
});

//View all Drives
studentTabs.post("/drive",(req,res)=>{
  res.render("student/dashboard-tabs/view-drives");
});

//View Specific Drive
studentTabs.post("/drive/:drive",(req,res)=>{
  var drive=req.params.drive;
  res.render("student/dashboard-tabs/drive",{
    drive
  });
});

//Apply for Specific Drive
studentTabs.post("/drive/:drive/apply",(req,res)=>{
  var drive=req.params.drive;
  res.render("student/dashboard-tabs/apply-for-drive",{
    drive
  });
});

//participate in drive
studentTabs.post("/drive/:drive/round/:round",(req,res)=>{
  var drive=req.params.drive;
  var round=req.params.round;
  res.render("student/dashboard-tabs/participate-in-drive",{
    drive,
    round
  });
});

//skill tracking
studentTabs.post("/skills/tracking",(req,res)=>{
  res.render("student/dashboard-tabs/skill-tracker");
});

//external jobs via api
studentTabs.post("/external",(req,res)=>{
  res.render("student/dashboard-tabs/external-jobs");
});

module.exports=studentTabs;
