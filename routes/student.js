const {version}=require("../package.json");
const express=require("express");
const studentTabs=require("./student-tabs");
const student=express.Router();
const User=require("../functions/user.js");

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
  await user.initialize().then(async(data)=>{
    isLoggedIn=data.isLoggedIn && (data.type=="coordinator" || data.type=="student");
    if(isLoggedIn)//loggedin
    {
      var data=await user.getUserData(data.user);
      isLoggedIn=data.success;
      if(isLoggedIn)//returned data successfully
      {
        // console.log(data);
        var profile=data.result.data;//undefined if profile is incomplete
        console.log(profile);
      }
    }
  }).catch(error=>{
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
        title:"Complete Profile"
      });
    }
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
