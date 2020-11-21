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
          html:`
            <div class="wrapper" style="width: 100%; text-align: center;">
              <div class="title" style="font-size: 23px; font-weight: 900; font-family: monospace; padding: 20px 10px; letter-spacing: 1px;">Placement Prediction & Management System</div>
              <div class="box" style="background:url('https://www.prosec-networks.com/wp-content/uploads/2019/06/web_app_testing.jpg') no-repeat center;background-size:cover;height:400px;">
                <div class="sub-title" style="font-family: sans-serif; font-size: 30px; color: #FFF; font-weight: 900; letter-spacing: 1px;padding:110px 0px;">Verify E-Mail</div>
                <div class="sub-wrapper">
                  <a href="http://${config.SERVER.HOST}:${config.SERVER.PORT}/student/profile/new" target="_blank" style="background: linear-gradient(135deg,#64B5F6,#1E88E5); padding: 10px 30px; color: #000000; border-radius: 50px; text-decoration: none; font-family: monospace; font-size:16px;">Verify</a>
                </div>
              </div>
              <div class="dark" style="width: 100%; height: auto; min-height: 400px; background: #212121; color: #FFFFFF; padding: 50px 20px; box-sizing: border-box;">
                <div><div class="info" style="font-family: sans-serif; font-size: 15px; box-sizing: border-box; width: auto; display: inline-block; margin: 50px 0px; padding: 10px 50px; color: #000000; background:#2196F3; border-radius:5px;">Your OTP is valid for ${user_config.OTP.TIMEOUT} minutes</div></div>
                <div class="sub" style="font-family: sans-serif; margin: 10px 0px;">Your OTP is</div>
                <div><span class="sub-title otp" style="font-family: sans-serif; font-size: 30px; color: #FFF; font-weight: 900; letter-spacing: 1px;">${otp}</span></div>
                <div class="err" style="margin-top: 45px; font-family: sans-serif; font-size: 15px; color: #000000; background: #E91E63; display: inline-block; padding: 8px 15px; border-radius: 50px;">Do not share your OTP with anybody.</div>
              </div>
              <div class="light">
                <div class="title" style="font-size: 16px; font-weight: 900; font-family: monospace; padding: 20px 10px; letter-spacing: 1px;">Developed By</div>
                <div class="wrap" style="display: flex;">
                  <div class="title dev" style="font-size: 16px; font-weight: 900; font-family: monospace; padding: 20px 10px; letter-spacing: 1px; margin: 0px auto;">Anisha</div>
                  <div class="title dev" style="font-size: 16px; font-weight: 900; font-family: monospace; padding: 20px 10px; letter-spacing: 1px; margin: 0px auto;">Glorina</div>
                  <div class="title dev" style="font-size: 16px; font-weight: 900; font-family: monospace; padding: 20px 10px; letter-spacing: 1px; margin: 0px auto;">Rahul</div>
                </div>
              </div>
              <div style="color:#000000;padding:20px 0px;text-align:center;font-size:20px;letter-spacing:1px;background:linear-gradient(135deg,#64B5F6,#0D47A1)">Have a nice day !!!</div>
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
      // // form data
      console.log(req.body);
      //
      // // files
      console.log(req.files);
      // console.log(req.files["profilepic"]);
      // console.log(req.files["profilepic"].name);

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
