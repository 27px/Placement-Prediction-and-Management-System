const express=require("express");
const data=express.Router();
const User=require("../functions/user.js");

// sitemap
data.get("/sitemap",async(req,res)=>{
  const user=new User(req);
  var siteMap,code;
  await user.initialize().then(data=>{
    code=data.userCode();
    siteMap=[
      {
        key:"home",
        url:"/home",
        access:[
          data.userCode("guest"),
          data.userCode("student"),
          data.userCode("coordinator"),
          data.userCode("recruiter"),
          data.userCode("admin")
        ]
      },
      {
        key:"statistics",
        url:"/statistics",
        access:[
          data.userCode("guest"),
          data.userCode("student"),
          data.userCode("coordinator"),
          data.userCode("admin")
        ]
      },
      {
        key:"about",
        url:"/about",
        access:[
          data.userCode("guest"),
          data.userCode("student"),
          data.userCode("coordinator"),
          data.userCode("recruiter"),
          data.userCode("admin")
        ]
      },
      {
        key:"help",
        url:"/contact",
        access:[
          data.userCode("guest"),
          data.userCode("student"),
          data.userCode("coordinator"),
          data.userCode("recruiter"),
          data.userCode("admin")
        ]
      },
      {
        key:"gallery",
        url:"/gallery",
        access:[
          data.userCode("guest"),
          data.userCode("student"),
          data.userCode("coordinator"),
          data.userCode("recruiter"),
          data.userCode("admin")
        ]
      },
      {
        key:"team",
        url:"/team",
        access:[
          data.userCode("guest"),
          data.userCode("student"),
          data.userCode("coordinator"),
          data.userCode("recruiter"),
          data.userCode("admin")
        ]
      },
      {
        key:"dashboard",
        url:"/student/dashboard",
        access:[
          data.userCode("student"),
          data.userCode("coordinator")
        ]
      },
      {
        key:"settings",
        url:"/student/dashboard?tab=settings",
        access:[
          data.userCode("student"),
          data.userCode("coordinator")
        ]
      },
      {
        key:"placement drive",
        url:"/student/dashboard?tab=drive",
        access:[
          data.userCode("student"),
          data.userCode("coordinator")
        ]
      },
      {
        key:"skill tracker",
        url:"/student/dashboard?tab=skill-tracker",
        access:[
          data.userCode("student"),
          data.userCode("coordinator")
        ]
      },
      {
        key:"external jobs",
        url:"/student/dashboard?tab=external-jobs",
        access:[
          data.userCode("student"),
          data.userCode("coordinator")
        ]
      },
      {
        key:"dashboard",
        url:"/recruiter/dashboard",
        access:[
          data.userCode("recruiter")
        ]
      },
      {
        key:"details",
        url:"/recruiter/details",
        access:[
          data.userCode("recruiter")
        ]
      },
      {
        key:"post jobs",
        url:"/recruiter/recruitments",
        access:[
          data.userCode("recruiter")
        ]
      }
    ];
  }).catch(error=>{
    siteMap=[];
    code=0;
  }).finally(()=>{
    siteMap=siteMap.filter(page=>{
      return page.access.includes(code);
    }).map(page=>{
      return {
        key:page.key,
        url:page.url
      }
    });
    res.json(siteMap);
  });
});

// This is data/statistics
// statistics data for graph in dashboard
data.get("/statistics",(req,res)=>{
  res.end("statistics");
});

module.exports=data;
