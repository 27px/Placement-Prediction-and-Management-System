const {version}=require("../package.json");
const express=require("express");
const studentTabs=require("./student-tabs");
const student=express.Router();
const User=require("../functions/user.js");
const DB_CONNECTION_URL=require("../config/db.js");
const MongoClient=require('mongodb').MongoClient;
const config=require("../config/config.json");
const user_config=require("../config/user_config.json");
const mail_credentials=require("../config/mail.js");
const nodemailer=require('nodemailer');
const setMailOTP=require("../functions/mail_otp.js");
const setUpStudentProfileData=require("../functions/setUpStudentProfileData.js");

//Route Student
student.get("/",(req,res)=>{
  res.redirect("/student/dashboard");
});

//Student Dashboard
student.get("/dashboard",async(req,res)=>{
  const user=await new User(req);
  var isLoggedIn,type;
  await user.initialize().then(data=>{
    isLoggedIn=data.isLoggedIn;
    type=data.type;
  }).catch(error=>{
    console.log(error.message);
    isLoggedIn=false;
    type="guest";
  }).finally(async()=>{
    if(isLoggedIn===true && user.hasAccessOf("student"))//student or coordinator
    {
      var user_data=await user.getUserData(user.user);
      if(user_data.result.data!=undefined)
      {
        res.render("student/dashboard",{
          tab:req.query.tab,
          version,
          usertype:type
        });
      }
      else// profile incomplete
      {
        res.redirect("profile/new");
      }
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
  const user=await new User(req);
  var redirect="";
  var isLoggedIn=false;
  var type="guest";
  var verified=false;
  var otp=Math.random().toString().split("").splice(2,6).join("");
  var gen;//otp generated time //value assigns later
  await user.initialize().then(async(data)=>{
    isLoggedIn=data.isLoggedIn && user.hasAccessOf("student");
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
      var userData=await user.getUserData(data.user);
      isLoggedIn=userData.success;
      type=userData.type;
      var profile=userData.result.data;//undefined if profile is incomplete
      if(isLoggedIn && profile!=undefined)//returned data successfully
      {
        var rdr=userData.result.type=="coordinator"?"student":userData.result.type;
        redirect=`/${rdr}/dashboard`;
      }
      else if(!verified)
      {
        var transporter=await nodemailer.createTransport(mail_credentials);
        await transporter.sendMail({
          from:"Placement Manager",
          to:userData.result.email,
          subject:'Verify Account',
          html:setMailOTP(otp)
        }).then(async sent=>{
          // console.log(sent);
        });
      }
    }
  }).catch(error=>{
    console.log(error.message);
    isLoggedIn=false;
  }).finally(()=>{
    if(!isLoggedIn && redirect=="")
    {
      // req.session.destroy(); // no need to destroy session because there is no redirect in login page if already logged in. Instear shows a popup message
      res.redirect("/login");
    }
    else if(redirect!="")
    {
      res.redirect(redirect);
    }
    else
    {
      res.render("student/complete-profile",{
        title:"Complete Profile",
        timeout:user_config.OTP.TIMEOUT,
        submited:false,
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
  var userData={};
  const user=await new User(req);
  var isLoggedIn=false;
  var type="guest";
  var verified=true;//default for post
  await user.initialize().then(async(data)=>{
    isLoggedIn=data.isLoggedIn && user.hasAccessOf("student");
    if(isLoggedIn)//loggedin
    {
      userData=await user.getUserData(data.user);
      isLoggedIn=userData.success;
      type=userData.type;
      if(isLoggedIn)//returned data successfully
      {
        var profile=userData.result.data;//undefined if profile is incomplete
        if(profile!=undefined)
        {
          // this will not likely happen due to redirect
          // console.log("Already Inserted datas ??? Update Not Implemented");
          /////Update if already Exists ??? Possible ?
          //profile already complete
          isLoggedIn=false;
        }
      }
    }
  }).catch(error=>{
    console.log(error.message);
    isLoggedIn=false;
  }).finally(async()=>{
    if(!isLoggedIn)
    {
      // req.session.destroy(); // no need to destroy session because there is no redirect in login page if already logged in. Instear shows a popup message
      res.redirect("/login");
    }
    else
    {
      const student_data=new setUpStudentProfileData(req.body,req.files).data;
      var dir=`${__dirname}/../data`;
      var cdir=`${dir}/certificate`;
      var up=[
        req.files.profilepic.mv(`${dir}/profilepic/${userData.result.email}.${req.files.profilepic.name.split(".").pop()}`),
        req.files.idcard.mv(`${dir}/idcard/${userData.result.email}.${req.files.idcard.name.split(".").pop()}`),
        req.files.sslccertificate.mv(`${cdir}/${userData.result.email}-sslc.${req.files.sslccertificate.name.split(".").pop()}`),
        req.files.plustwocertificate.mv(`${cdir}/${userData.result.email}-plustwo.${req.files.plustwocertificate.name.split(".").pop()}`)
      ];
      ["course","experience","achievement"].forEach(cert=>{
        student_data.education[cert].forEach((temp,i)=>{
          up.push(req.files[`${cert}certificate-${i+1}`].mv(`${cdir}/${userData.result.email}-${cert}-${i+1}.${req.files[`${cert}certificate-${i+1}`].name.split(".").pop()}`));
        });
      });
      var sub={
        success:false,
        type:"error",
        message:"Unknown Error",
        devlog:"Unknown Error"
      };
      await Promise.all(up)
      .then(async(ret)=>{
        await MongoClient.connect(DB_CONNECTION_URL,{
          useUnifiedTopology:true
        }).then(async mongo=>{
          var db=await mongo.db(config.DB_SERVER.DB_DATABASE);
          await db.collection("user_data").updateOne({
            email:userData.result.email
          },{
            $set:{
              data:student_data,
              pic_ext:req.files.profilepic.name.split(".").pop()
            }
          }).then(t=>{
            res.redirect(`/${userData.result.type}/dashboard`);
          });
        });
      })
      .catch(err=>{
        console.log(err.message);
        res.render("student/complete-profile",{
          title:"Complete Profile",
          timeout:user_config.OTP.TIMEOUT,
          submited:{
            type:"error",
            message:"Error Submitting form",
            devlog:err.message,
          },
          otpgenerated:0,
          isLoggedIn,
          type,
          verified
        });
      });
    }
  });
});

//verify otp
student.post("/profile/new/verify-otp",async(req,res)=>{
  var message={};
  const user=await new User(req);
  var isLoggedIn=false;
  var type="guest";
  await user.initialize().then(async(data)=>{
    isLoggedIn=data.isLoggedIn;//from session
    type=data.type;//from session
    var userData=await user.getUserData(data.user,{
      "_id":0,
      otp:1,
      email:1
    });
    isLoggedIn=userData.success;
    type=userData.type;
    if(!userData.success)
    {
      throw new Error(userData.message);
    }
    if(userData.result.otp==undefined)
    {
      throw new Error("OTP not found/generated");
    }
    var created=new Date(userData.result.otp.generated);
    var otp=userData.result.otp.code.toString();
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
            email:userData.result.email
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

//Current User profile (custom resume)
student.get("/profile/view",async(req,res)=>{
  const user=await new User(req);
  await user.initialize().then(async data=>{
    if(!data.isLoggedIn)
    {
      throw new Error("Not logged in");
    }
    var userData=await user.getUserData(data.user);
    if(!userData.success)
    {
      throw new Error("Data fetch error");
    }
    res.render("student/resume",{
      data:userData.result,
      showNavBar:true,
      path:""
    });
  }).catch(error=>{
    console.log(error.message);
    res.redirect("/login");
  });
});

//Profile of others
student.get("/profile/view/:id",(req,res)=>{
  var userID=req.params.id;
  res.render("student/view-profile",{
    user:userID
  });
});

//Student Dashboard Tabs
student.use("/dashboard",studentTabs);

module.exports=student;
