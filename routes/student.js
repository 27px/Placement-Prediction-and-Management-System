const {version}=require("../package.json");
const express=require("express");
const studentTabs=require("./student-tabs");
const student=express.Router();
const User=require("../functions/user.js");
const DB_CONNECTION_URL=require("../config/db.js");
const MongoClient=require('mongodb').MongoClient;
const config=require("../config/config.json");
const user_config=require("../user_config/user_config.json");
const mail_credentials=require("../config/mail.js");
const nodemailer=require('nodemailer');
const chalk=require("chalk");

//Route Student
student.get("/",(req,res)=>{
  res.redirect("/student/dashboard");
});

//Student Dashboard
student.get("/dashboard",async(req,res)=>{
  const user=new User(req);
  var isLoggedIn,type;
  await user.initialize().then(data=>{
    isLoggedIn=data.isLoggedIn;
    type=data.type;
  }).catch(error=>{
    isLoggedIn=false;
    type="guest";
  }).finally(()=>{
    if(isLoggedIn===true && ["student","coordinator"].includes(type))//student or coordinator
    {
      res.render("student/dashboard",{
        tab:req.query.tab,
        version,
        usertype:type
      });
    }
    else if(isLoggedIn===true)//other users
    {
      res.redirect("/404");
    }
    else
    {
      res.redirect("/login");
    }
  });


  // const user=new User(req);
  // //student or coordinator
  // if(req.session.user!==undefined && ( req.session.type==="student" || req.session.type==="coordinator" ))
  // {
  //   res.render("student/dashboard",{
  //     tab:req.query.tab,
  //     version,
  //     usertype:user.type
  //   });
  // }
  // else if(req.session.user!==undefined && req.session.type!==undefined)//other users
  // {
  //   res.redirect("/404");
  // }
  // else
  // {
  //   res.redirect("/login");
  // }
});

student.get("/profile/new",async(req,res)=>{
  const user=new User(req);
  var isLoggedIn=false;
  var type="guest";
  var verified=false;
  await user.initialize().then(async(data)=>{
    isLoggedIn=data.isLoggedIn && (data.type=="coordinator" || data.type=="student");
    if(isLoggedIn)//loggedin
    {
      var otp=Math.random().toString().split("").splice(2,6).join("");
      var gen;//otp generated time //value assigns later
      await MongoClient.connect(DB_CONNECTION_URL,{
        useUnifiedTopology:true
      }).then(async mongo=>{
        var db=await mongo.db(config.DB_SERVER.DB_DATABASE);
        gen=Date.now();
        await db.collection("user_data")
        .findOne({
          email:data.user
        }).then(dbr=>{
          verified=(dbr.otp=="verified");
        });
        if(!verified)
        {
          await db.collection("user_data").updateOne({
            email:data.user
          },{
            $set:{
              otp:{
                generated:gen,
                code:otp
              }
            }
          }).then(async up=>{
            // console.log(up);
          });
        }
      });
      if(!verified)
      {
        var transporter=await nodemailer.createTransport(mail_credentials);
        await transporter.sendMail({
          from:"Placement Manager",
          to:data.user,
          subject:'Verify Account',
          html:`
                <div style="color:#000000;width:100%;box-sizing:border-box;background-image:repeating-linear-gradient(45deg, rgba(112, 112, 112, 0.12) 0px, rgba(112, 112, 112, 0.12) 42px,rgba(105, 105, 105, 0.12) 42px, rgba(105, 105, 105, 0.12) 83px,rgba(206, 206, 206, 0.12) 83px, rgba(206, 206, 206, 0.12) 103px,rgba(130, 130, 130, 0.12) 103px, rgba(130, 130, 130, 0.12) 125px,rgba(51, 51, 51, 0.12) 125px, rgba(51, 51, 51, 0.12) 174px,rgba(220, 220, 220, 0.12) 174px, rgba(220, 220, 220, 0.12) 199px),repeating-linear-gradient(45deg, rgba(192, 192, 192, 0.12) 0px, rgba(192, 192, 192, 0.12) 13px,rgba(119, 119, 119, 0.12) 13px, rgba(119, 119, 119, 0.12) 29px,rgba(157, 157, 157, 0.12) 29px, rgba(157, 157, 157, 0.12) 75px,rgba(223, 223, 223, 0.12) 75px, rgba(223, 223, 223, 0.12) 121px,rgba(80, 80, 80, 0.12) 121px, rgba(80, 80, 80, 0.12) 169px,rgba(208, 208, 208, 0.12) 169px, rgba(208, 208, 208, 0.12) 194px),repeating-linear-gradient(45deg, rgba(44, 44, 44, 0.1) 0px, rgba(44, 44, 44, 0.1) 147px,rgba(38, 38, 38, 0.1) 147px, rgba(38, 38, 38, 0.1) 248px,rgba(1, 1, 1, 0.1) 248px, rgba(1, 1, 1, 0.1) 325px,rgba(34, 34, 34, 0.1) 325px, rgba(34, 34, 34, 0.1) 434px,rgba(98, 98, 98, 0.1) 434px, rgba(98, 98, 98, 0.1) 534px,rgba(79, 79, 79, 0.1) 534px, rgba(79, 79, 79, 0.1) 630px),linear-gradient(90deg, rgb(153, 255, 73),rgb(51, 204, 35));background-size:cover;background-attachment:fixed;
                padding:20px;">
                  <center><h1>Placement Prediction & Management System</h1></center>
                </div>
                <p style="background:#f44336;color:#000000;padding:2px 10px;display:inline-block;font-weight:900;">Do not share your OTP with anyone.</p><br><br>
                <div style="font-size:20px;">
                  <i>Your OTP is</i> <b style="color:#0D47A1;font-size:25px;">${otp}</b><br>
                  <i>OTP will expire in <b style="color:#F57F17;">${user_config.OTP.TIMEOUT} minutes</b></i><br>
                  <i>OTP is only valid until <u>${new Date(gen+(user_config.OTP.TIMEOUT*60*1000))}</u></i>
                </div>
              `
        }).then(async sent=>{
          // console.log(sent);
        });
        var data=await user.getUserData(data.user);
        isLoggedIn=data.success;
        type=data.type;
        if(isLoggedIn)//returned data successfully
        {
          var profile=data.result.data;//undefined if profile is incomplete
          if(profile!=undefined)
          {
            //profile already complete
            isLoggedIn=false;
          }
        }
      }
    }
  }).catch(error=>{
    console.log(error.message);
    isLoggedIn=false;
  }).finally(()=>{
    if(!isLoggedIn)
    {
      // req.session.destroy(); // no need to destroy session because there is no redirect in login page if already logged in. Instear shows a popup message
      res.redirect("/login");
    }
    else
    {
      res.render("student/complete-profile",{
        title:"Complete Profile",
        timeout:user_config.OTP.TIMEOUT,
        isLoggedIn,
        type,
        verified
      });
    }
  });
});

//Handle Form Upload
student.post("/profile/new",(req,res)=>{
  // // form data
  // console.log(req.body);
  //
  // // files
  // console.log(req.files);
  // console.log(req.files["profilepic"]);
  // console.log(req.files["profilepic"].name);
  res.json({message:"Not Implemented"});
  res.end();
});

//verify otp
student.post("/profile/new/verify-otp",async(req,res)=>{
  var message={};
  const user=new User(req);
  var isLoggedIn=false;
  var type="guest";
  await user.initialize().then(async(data)=>{
    isLoggedIn=data.isLoggedIn;//from session
    type=data.type;//from session
    var data=await user.getUserData(data.user);
    isLoggedIn=data.success;
    type=data.type;
    if(!data.success)
    {
      throw new Error(data.message);
    }
    if(data.result.otp==undefined)
    {
      throw new Error("OTP not found/generated");
    }
    var created=new Date(data.result.otp.generated);
    var otp=data.result.otp.code.toString();
    if(req.body.otp.toString()!=otp)
    {
      message.success=false;
      message.message="Invalid OTP";
    }
    else
    {
      var diff=parseInt((Date.now()-created)/(1000*60));
      if(diff>user_config.OTP.TIMEOUT)
      {
        message.success=false;
        message.message="OTP Expired";
      }
      else
      {
        message.success=true;
        message.message="OTP Verified";

        await MongoClient.connect(DB_CONNECTION_URL,{
          useUnifiedTopology:true
        }).then(async mongo=>{
          var db=await mongo.db(config.DB_SERVER.DB_DATABASE);
          await db.collection("user_data").updateOne({
            email:data.result.email
          },{
            $set:{
              otp:"verified"
            }
          }).then(async up=>{
            // console.log(up);
          });
        });
      }
    }
  }).catch(error=>{
    isLoggedIn=false;
    type="guest";
    console.log(error.message);
    message.success=false;
    message.message="Unknown Error";
    message.devlog=error.message;
  }).finally(()=>{
    res.json(message);
  });
});

//Profile of others or current user
student.get("/profile/view/:id",(req,res)=>{
  var userID=req.params.id;
  res.render("student/view-profile",{
    user:userID
  });
});

//Student Dashboard Tabs
student.use("/dashboard",studentTabs);

module.exports=student;
