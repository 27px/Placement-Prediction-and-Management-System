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
      if(jobPosted)
      {
        recruiteraccepted=userData.result.data.job.schedule.recruiteraccepted;
        adminaccepted=userData.result.data.job.schedule.adminaccepted;
        scheduleDate=userData.result.data.job.schedule.date;
        selectedStudents=userData.result.data.job.selected;
        appliedStudents=userData.result.data.job.applied.map(student=>user.getUserData(student));
        appliedStudents=await Promise.all(appliedStudents);
        appliedStudents=appliedStudents.map(student=>{
          return {
            name:student.result.data.name,
            email:student.result.email,
            department:student.result.data.admission.course,
            pic_ext:student.result.pic_ext,
            skills:student.result.data.education.skills
          };
        });
        mhskills=userData.result.data.job.mhskills;
        ghskills=userData.result.data.job.ghskills;
      }
      else
      {
        recruiteraccepted=false;
        adminaccepted=false;
        scheduleDate="";
        appliedStudents=[];
        mhskills=[];
        ghskills=[];
        selectedStudents=[];
      }
    }
    res.render(`recruiter/${req.params.tab}`,{
      jobPosted,
      notifications:userData.result.messages,
      recruiteraccepted,
      adminaccepted,
      scheduleDate,
      appliedStudents,
      selectedStudents,
      mhskills,
      ghskills
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
  var job=req.params.job;
  res.render("recruiter/add-mcq",{
    job
  });
});

// Recruit a Student
recruiter.get("/recruitments/:student/recruit",async(req,res)=>{
  var student=req.params.student;
  const user=await new User(req);
  await user.initialize().then(async data=>{
    var userData=await user.getUserData(user.user);
    if(data.isLoggedIn)
    {
      await MongoClient.connect(DB_CONNECTION_URL,{
        useUnifiedTopology:true
      }).then(async mongo=>{
        var db=await mongo.db(config.DB_SERVER.DB_DATABASE);
        var userTable=await db.collection("user_data");
        Promise.all([
          userTable
          .updateOne({
            email:user.user
          },{
            $push:{
              "data.job.selected":student
            }
          }),
          userTable
          .updateOne({
            email:student
          },{
            $push:{
              "messages":{
                title:"Placement",
                message:`Congrats, You are Selected by <b>${userData.result.data.name}</b>`
              }
            }
          })
        ]).then(d=>{
          // console.log(d);
          res.json({
            success:true
          });
        })
      }).catch(err=>{
        console.log(err.message);
        res.json({
          success:false,
          message:err.message
        });
      });
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
      message:error.message
    });
  });
});

//Request Schedule
recruiter.post("/schedule/request",async(req,res)=>{
  var date=req.body.scheduleDate;
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
          console.log(date);
          await db.collection("user_data")
          .updateOne({
            email:user.user
          },{
            $set:{
              "data.job.schedule.adminaccepted":false,
              "data.job.schedule.recruiteraccepted":true,
              "data.job.schedule.date":date
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

module.exports=recruiter;
