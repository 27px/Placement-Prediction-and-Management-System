const express=require("express");
const admin=express.Router();
const User=require("../functions/user.js");

//Route admin
admin.get("/",(req,res)=>{
  res.redirect("admin/dashboard");
});

//admin Home
admin.get("/dashboard",async(req,res)=>{
  const user=new User(req);
  await user.initialize().then(async data=>{
    if(!data.isLoggedIn)
    {
      throw new Error("Authentication Failed");
    }
    var userData=await user.getUserData(data.user);
    if(!userData.success)
    {
      throw new Error("Authentication Failed . . .");
    }
    if(!user.hasAccessOf("admin"))
    {
      throw new Error("Access Denied");
    }
    res.render("recruiter/dashboard",{
      usertype:userData.result.type,
      email:userData.result.email
    });// same for recruiter and admin
  }).catch(error=>{
    console.log(error.message);
    res.redirect("/login");
  });
});

admin.post("/dashboard/:tab",(req,res)=>{
  res.render(`admin/${req.params.tab}`);
});


//Manage Students
admin.get("/students/modify",(req,res)=>{
  res.render("admin/manage-students");
});

//Alumni data
admin.get("/alumni",(req,res)=>{
  res.render("alumni");
});

//configurations
admin.get("/configurations",(req,res)=>{
  res.render("admin/configurations");
});

//Dump data
admin.get("/dump/data",(req,res)=>{
  res.render("admin/dump-data");
});

//Manage Coordinators
admin.get("/coordinators/modify",(req,res)=>{
  res.render("admin/manage-coordinators");
});

//Report Generation
admin.get("/report/generate",(req,res)=>{
  res.render("admin/generate-report");
});

module.exports=admin;
