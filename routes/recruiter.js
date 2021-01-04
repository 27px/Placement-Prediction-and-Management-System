const express=require("express");
const recruiter=express.Router();
const User=require("../functions/user.js");
const getResultFromCursor=require("../functions/getResultFromCursor.js");
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
    var userData=await user.getUserData(data.user,{
      "_id":0,
      type:1,
      email:1
    });
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

//Main Dashboard Tab
recruiter.post("/dashboard/main",async(req,res)=>{
  const user=await new User(req);
  await user.initialize().then(async data=>{
    if(!data.isLoggedIn)
    {
      throw new Error("Authentication Failed");
    }
    var userData=await user.getUserData(data.user,{
      "_id":0,
      messages:1,
      "data.job.schedule.recruiteraccepted":1,
      "data.job.schedule.adminaccepted":1
    });
    if(!userData.success)
    {
      throw new Error("Authentication Failed . . .");
    }
    if(!user.hasAccessOf("recruiter"))
    {
      throw new Error("Access Denied");
    }
    var recruiteraccepted=false;
    var adminaccepted=false;
    if(userData.result.data.job!=undefined)
    {
      if(userData.result.data.job.schedule!=undefined)
      {
        recruiteraccepted=userData.result.data.job.schedule.recruiteraccepted;
        adminaccepted=userData.result.data.job.schedule.adminaccepted;
      }
    }
    res.render(`recruiter/main`,{
      notifications:userData.result.messages,
      recruiteraccepted,
      adminaccepted
    });
  }).catch(error=>{
    console.log(error.message);
    res.status(500);
    res.end();
  });
});


//Job tab
recruiter.post("/dashboard/job",async(req,res)=>{
  const user=await new User(req);
  await user.initialize().then(async data=>{
    if(!data.isLoggedIn)
    {
      throw new Error("Authentication Failed");
    }
    var userData=await user.getUserData(data.user,{
      "_id":0,
      "data.job":1
    });
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
    res.render(`recruiter/job`,{
      jobPosted
    });
  }).catch(error=>{
    console.log(error.message);
    res.status(500);
    res.end();
  });
});

//Schedule
recruiter.post("/dashboard/schedule",async(req,res)=>{
  const user=await new User(req);
  await user.initialize().then(async data=>{
    if(!data.isLoggedIn)
    {
      throw new Error("Authentication Failed");
    }
    var userData=await user.getUserData(data.user,{
      "_id":0,
      "data.job.schedule":1,
      "data.job.date":1
    });
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
        closingDate=userData.result.data.job.date;
      }
      else
      {
        recruiteraccepted=false;
        adminaccepted=false;
        scheduleDate="";
        closingDate=new Date();//dummy
      }
    }
    res.render(`recruiter/schedule`,{
      jobPosted,
      recruiteraccepted,
      adminaccepted,
      scheduleDate,
      closingDate
    });
  }).catch(error=>{
    console.log(error.message);
    res.status(500);
    res.end();
  });
});

//Student Tabs
recruiter.post("/dashboard/students",async(req,res)=>{
  const user=await new User(req);
  await user.initialize().then(async data=>{
    if(!data.isLoggedIn)
    {
      throw new Error("Authentication Failed");
    }
    var userData=await user.getUserData(data.user,{
      "_id":0,
      "data.job.selected":1,
      "data.job.mhskills":1,
      "data.job.ghskills":1,
      "data.job.vacancy":1,
      "data.job.applied":1
    });
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
        selectedStudents=userData.result.data.job.selected;
        mhskills=userData.result.data.job.mhskills;
        ghskills=userData.result.data.job.ghskills;
        vacancy=userData.result.data.job.vacancy;
        var appliedStudents=userData.result.data.job.applied.map(x=>{return {email:x}});
        if(appliedStudents.length>0)
        {
          await MongoClient.connect(DB_CONNECTION_URL,{
            useUnifiedTopology:true
          }).then(async mongo=>{
            const db=await mongo.db(config.DB_SERVER.DB_DATABASE);
            var cursor=await db.collection("user_data")
            .aggregate([
              {
                $match:{
                  $or:appliedStudents
                }
              },
              {
                $project:{
                  name:"$data.name",
                  email:"$email",
                  department:"$data.admission.course",
                  pic_ext:"$pic_ext",
                  skills:"$data.education.skills"
                }
              }
            ]);
            appliedStudents=await getResultFromCursor(cursor);
          });
        }
      }
      else
      {
        appliedStudents=[];
        mhskills=[];
        ghskills=[];
        selectedStudents=[];
        vacancy=0;
      }
    }
    res.render(`recruiter/students`,{
      jobPosted,
      appliedStudents,
      mhskills,
      ghskills,
      selectedStudents,
      vacancy
    });
  }).catch(error=>{
    console.log(error.message);
    res.status(500);
    res.end();
  });
});

// //Edit company details
// recruiter.get("/details/update",(req,res)=>{
//   res.render("recruiter/edit-details");
// });

//Add Jobs/Internships
recruiter.post("/recruitments/add",async(req,res)=>{
  const user=await new User(req);
  await user.initialize().then(async data=>{
    if(data.isLoggedIn)
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

// //Add MCQ for jobs/internships
// recruiter.get("/recruitments/:job/add/mcq",(req,res)=>{
//   var job=req.params.job;
//   res.render("recruiter/add-mcq",{
//     job
//   });
// });

// Recruit a Student
recruiter.get("/recruitments/:student/recruit",async(req,res)=>{
  var student=req.params.student;
  const user=await new User(req);
  await user.initialize().then(async data=>{
    var userData=await user.getUserData(user.user,{
      "_id":0,
      "data.name":1
    });
    if(data.isLoggedIn)
    {
      return [await MongoClient.connect(DB_CONNECTION_URL,{
        useUnifiedTopology:true
      }),userData];
    }
    else
    {
      throw new Error("Not Loggedin");
    }
  }).then(async ([mongo,userData])=>{
    var db=await mongo.db(config.DB_SERVER.DB_DATABASE);
    var userTable=await db.collection("user_data");
    return Promise.all([
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
        $set:{
          "data.admission.placed":true
        },
        $push:{
          "messages":{
            title:"Placement",
            message:`Congrats, You are Selected by <b>${userData.result.data.name}</b>`
          }
        }
      })
    ]);
  }).then(d=>{
    // console.log(d);
    res.json({
      success:true
    });
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
      await MongoClient.connect(DB_CONNECTION_URL,{
        useUnifiedTopology:true
      }).then(async mongo=>{
        var db=await mongo.db(config.DB_SERVER.DB_DATABASE);
        // console.log(date);
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
