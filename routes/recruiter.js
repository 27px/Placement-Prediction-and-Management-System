const express=require("express");
const recruiter=express.Router();
const User=require("../functions/user.js");
const MongoClient=require("mongodb").MongoClient;
const DB_CONNECTION_URL=require("../config/db.js");
const config=require("../config/config.json");

//Route Recruiter
recruiter.get("/",(req,res)=>{
  res.redirect("recruiter/dashboard");
});

//Recruiter Home
recruiter.get("/dashboard",async(req,res)=>{
  const user=await new User(req);
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
    if(!user.hasAccessOf("recruiter"))
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

//Dashboard Tabs
recruiter.post("/dashboard/:tab",async(req,res)=>{
  const user=await new User(req);
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
    if(!user.hasAccessOf("recruiter"))
    {
      throw new Error("Access Denied");
    }
    var jobPosted=false;
    if(userData.result.data!=undefined)
    {
      jobPosted=userData.result.data.job!=undefined;
    }
    res.render(`recruiter/${req.params.tab}`,{
      jobPosted,
      notifications:userData.result.messages
    });
  }).catch(error=>{
    console.log(error.message);
    res.status(500);
    res.end();
  });
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
recruiter.post("/recruitments/add",async(req,res)=>{
  const user=await new User(req);
  await user.initialize().then(async data=>{
    if(data.isLoggedIn)
    {
      var userData=await user.getUserData(user.user);
      if(userData.success)
      {
        await MongoClient.connect(DB_CONNECTION_URL,{
          useUnifiedTopology:true
        }).then(async mongo=>{
          var db=await mongo.db(config.DB_SERVER.DB_DATABASE);
          await db.collection("user_data")
          .updateOne({
            email:user.user,
            // job:{
            //   $exists:false
            // }
          },{
            $set:{
              "data.job":req.body
            }
          })
          .then(d=>{
            // console.log(d);
            res.json({
              success:true
            });
          }).catch(e=>{
            console.log(e.message);
            res.json({
              success:false,
              message:"Database Error",
              devlog:e.message
            });
          })
        }).catch(err=>{
          console.log(err.message);
          res.json({
            success:false,
            message:"Database Error",
            devlog:err.message
          });
        });
      }
      else
      {
        res.json({
          success:false,
          message:"Authentication failed",
          devlog:userData.message
        });
      }
    }
    else
    {
      res.json({
        success:false,
        message:"Not Loggedin"
      });
    }
  }).catch(error=>{
    console.log(error.message);
    res.json({
      success:false,
      message:"An Error occured",
      devlog:error.message
    });
  });
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
