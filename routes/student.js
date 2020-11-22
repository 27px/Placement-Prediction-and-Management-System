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
const setMailOTP=require("../functions/mail_otp.js");
const setUpStudentProfileData=require("../functions/setUpStudentProfileData.js");
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
    console.log(error.message);
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
});

student.get("/profile/new",async(req,res)=>{
  const user=new User(req);
  var isLoggedIn=false;
  var type="guest";
  var verified=false;
  var otp=Math.random().toString().split("").splice(2,6).join("");
  var gen;//otp generated time //value assigns later
  await user.initialize().then(async(data)=>{
    isLoggedIn=data.isLoggedIn && (data.type=="coordinator" || data.type=="student");
    if(isLoggedIn)//loggedin
    {
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
          })
        }
      });
      if(!verified)
      {
        var transporter=await nodemailer.createTransport(mail_credentials);
        await transporter.sendMail({
          from:"Placement Manager",
          to:data.user,
          subject:'Verify Account',
          html:setMailOTP(otp)
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
        submited:false,
        submittype:"",
        submitmessage:"",
        submitdevlog:"",
        otpgenerated:gen,
        isLoggedIn,
        type,
        verified
      });
    }
  });
});

//Handle Form Upload
student.post("/profile/new",async(req,res)=>{
  const user=new User(req);
  var isLoggedIn=false;
  var type="guest";
  var verified=true;//default for post
  await user.initialize().then(async(data)=>{
    isLoggedIn=data.isLoggedIn && (data.type=="coordinator" || data.type=="student");
    if(isLoggedIn)//loggedin
    {
      var data=await user.getUserData(data.user);
      isLoggedIn=data.success;
      type=data.type;
      if(isLoggedIn)//returned data successfully
      {
        var profile=data.result.data;//undefined if profile is incomplete
        if(profile!=undefined)
        {
          /////Update if already Exists ??? Possible ?
          //profile already complete
          isLoggedIn=false;
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
      console.log(chalk.blue.inverse("Started Reading Form"));
      // // form data
      console.log(req.body);
      // // files
      // console.log(req.files);

      // console.log(req.files["profilepic"]);
      // console.log(req.files["profilepic"].name);




      const student_data=new setUpStudentProfileData(req.body,req.files).data;
      /////set pic_ext & messages as {}


      console.log(JSON.stringify(student_data,null,2));
      /////process update to mongodb
      // redirect if success

      res.render("student/complete-profile",{
        title:"Complete Profile",
        timeout:user_config.OTP.TIMEOUT,
        submited:true,
        submittype:"warning",
        submitmessage:"Not Implemented",
        submitdevlog:"Code incomplete",
        otpgenerated:0,
        isLoggedIn,
        type,
        verified
      });
    }
  });
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
    console.log(error.message);
    isLoggedIn=false;
    type="guest";
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
