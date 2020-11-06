const express=require("express");
const data=express.Router();
const User=require("../functions/user.js");

// sitemap
data.get("/sitemap",(req,res)=>{
  const user=new User(req.session);
  const code=user.code;
  var siteMap=[
    {
      key:"home",
      url:"/home",
      access:[
        user.userCode("guest"),
        user.userCode("student"),
        user.userCode("coordinator"),
        user.userCode("recruiter"),
        user.userCode("admin")
      ]
    },
    {
      key:"statistics",
      url:"/statistics",
      access:[
        user.userCode("guest"),
        user.userCode("student"),
        user.userCode("coordinator"),
        user.userCode("admin")
      ]
    },
    {
      key:"about",
      url:"/about",
      access:[
        user.userCode("guest"),
        user.userCode("student"),
        user.userCode("coordinator"),
        user.userCode("recruiter"),
        user.userCode("admin")
      ]
    },
    {
      key:"help",
      url:"/contact",
      access:[
        user.userCode("guest"),
        user.userCode("student"),
        user.userCode("coordinator"),
        user.userCode("recruiter"),
        user.userCode("admin")
      ]
    },
    {
      key:"gallery",
      url:"/gallery",
      access:[
        user.userCode("guest"),
        user.userCode("student"),
        user.userCode("coordinator"),
        user.userCode("recruiter"),
        user.userCode("admin")
      ]
    },
    {
      key:"team",
      url:"/team",
      access:[
        user.userCode("guest"),
        user.userCode("student"),
        user.userCode("coordinator"),
        user.userCode("recruiter"),
        user.userCode("admin")
      ]
    },
    {
      key:"dashboard",
      url:"/student/dashboard",
      access:[
        user.userCode("student"),
        user.userCode("coordinator")
      ]
    },
    {
      key:"settings",
      url:"/student/dashboard?tab=settings",
      access:[
        user.userCode("student"),
        user.userCode("coordinator")
      ]
    },
    {
      key:"placement drive",
      url:"/student/dashboard?tab=drive",
      access:[
        user.userCode("student"),
        user.userCode("coordinator")
      ]
    },
    {
      key:"skill tracker",
      url:"/student/dashboard?tab=skill-tracker",
      access:[
        user.userCode("student"),
        user.userCode("coordinator")
      ]
    },
    {
      key:"external jobs",
      url:"/student/dashboard?tab=external-jobs",
      access:[
        user.userCode("student"),
        user.userCode("coordinator")
      ]
    },
    {
      key:"dashboard",
      url:"/recruiter/dashboard",
      access:[
        user.userCode("recruiter")
      ]
    },
    {
      key:"details",
      url:"/recruiter/details",
      access:[
        user.userCode("recruiter")
      ]
    },
    {
      key:"post jobs",
      url:"/recruiter/recruitments",
      access:[
        user.userCode("recruiter")
      ]
    }
  ];
  siteMap=siteMap.filter(page=>{
    return page.access.includes(code);
  }).map(page=>{
    return {
      key:page.key,
      url:page.url
    }
  });
  //testing delay
  setTimeout(function(){
    res.json(siteMap);
  },30000);
});

// This is data/statistics
// statistics data for graph in dashboard
data.get("/statistics",(req,res)=>{
  res.end("statistics");
});

module.exports=data;
