const express=require("express");
const studentTabs=express.Router();
const User=require("../functions/user.js");
const MongoClient=require("mongodb").MongoClient;
const DB_CONNECTION_URL=require("../config/db.js");
const config=require("../config/config.json");
const chalk=require("chalk");

//Main Home tab in Dashboard of Student
studentTabs.post("/main",async(req,res)=>{
  /////Use Promise.all() to fetch all datas
  const user=new User(req);
  await user.initialize().then(async(data)=>{
    if(data.isLoggedIn && user.hasAccessOf("student"))
    {
      var userData=await user.getUserData(data.user);
      // console.log(JSON.stringify(userData,null,2));


      await MongoClient.connect(DB_CONNECTION_URL,{
        useUnifiedTopology:true
      }).then(async mongo=>{
        var db=await mongo.db(config.DB_SERVER.DB_DATABASE);
        // await db.collection("user_data")
        // .findOne({
        //   email:data.user
        // }).then(dbr=>{
        //   verified=(dbr.otp=="verified");
        // });


        await Promise.all([
          db.collection("user_data").find({type:"recruiter"}).limit(10),
          db.collection("user_data").find({type:"student"}),
          db.collection("user_data").find({
            $or:[
              {
                type:"student"
              },{
                type:"coordinator"
              }
            ]
          })
        ]).then(ret=>{
          let ix=0;
          ret.forEach(r=>{
            console.log(++ix);
            console.log(r);
          });
        }).catch(err=>{
          console.log(chalk.red.inverse("Inner Error"));
          console.log(err.message);
        });


      });



      res.render(`student/dashboard-tabs/main`,{
        email:userData.result.email,
        profilepic:`../data/profilepic/${userData.result.email}.${userData.result.pic_ext}`,
        name:userData.result.data.name,
        course:userData.result.data.admission.course,
        phone:userData.result.data.phone,
        about:userData.result.data.about
      });
    }
    else
    {
      throw new Error("Not Logged In / Don't have access");
    }
  }).catch(error=>{
    console.log(error.message);
    res.end("");
  });
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
