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

//Profile of others or current user
student.get("/profile/:id",(req,res)=>{
  var userID=req.params.id;
  res.render("student/view-profile",{
    user:userID
  });
});

//Student Dashboard Tabs
student.use("/dashboard",studentTabs);

module.exports=student;
