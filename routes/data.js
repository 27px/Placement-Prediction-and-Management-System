const express=require("express");
const data=express.Router();
const User=require("../functions/user.js");
const DB_CONNECTION_URL=require("../config/db.js");
const config=require("../config/config.json");
const MongoClient=require("mongodb").MongoClient;

// This is data/statistics
// statistics data for graph in dashboard
data.get("/statistics",(req,res)=>{
  res.end("statistics");
});

//course Names
data.get("/course/name",async(req,res)=>{
  var department=[];
  await MongoClient.connect(DB_CONNECTION_URL,{
    useUnifiedTopology:true
  }).then(async mongo=>{
    const db=await mongo.db(config.DB_SERVER.DB_DATABASE);
    var cursor=await db.collection("department")
    .find({})
    .project({name:1,courses:1,engineering:1});
    await cursor.each((err,item)=>{
      if(err!=null || item==null)
      {
        res.json(department);
        cursor.close();
        return;
      }
      else
      {
        department.push(item);
      }
    });
  }).catch(error=>{
    console.log(error.message);
    res.json([]);
  });
});

// sitemap
data.get("/sitemap",async(req,res)=>{
  const user=await new User(req);
  var siteMap,code;
  await user.initialize().then(data=>{
    code=data.userCode();
    siteMap=[
      {
        key:"home",
        url:"/home",
        newTab:false,
        inlineTab:false
      },
      {
        key:"statistics",
        url:"/statistics",
        newTab:true,
        inlineTab:false
      },
      {
        key:"gallery",
        url:"/gallery",
        newTab:true,
        inlineTab:false
      },
      {
        key:"team",
        url:"/team",
        newTab:true,
        inlineTab:false
      },
      {
        key:"about",
        url:"/about",
        newTab:true,
        inlineTab:false
      },
      {
        key:"help",
        url:"/contact",
        newTab:true,
        inlineTab:false
      },
      {
        key:"contact",
        url:"/contact",
        newTab:true,
        inlineTab:false
      },
      {
        key:"feedback",
        url:"/contact",
        newTab:true,
        inlineTab:false
      },
      {
        key:"suggestion",
        url:"/contact",
        newTab:true,
        inlineTab:false
      },
      {
        key:"dashboard",
        url:"/student/dashboard",
        newTab:false,
        inlineTab:false
      },
      {
        key:"profile",
        url:"/student/profile/view",
        newTab:true,
        inlineTab:false
      },
      {
        key:"logout",
        url:"/logout",
        newTab:false,
        inlineTab:false
      },
      {
        key:"prediction",
        url:"prediction",
        newTab:false,
        inlineTab:true
      },
      {
        key:"placement prediction",
        url:"prediction",
        newTab:false,
        inlineTab:true
      },
      {
        key:"skill recommendation",
        url:"recommendation",
        newTab:false,
        inlineTab:true
      },
      {
        key:"recommendation",
        url:"skill",
        newTab:false,
        inlineTab:true
      },
      {
        key:"drive",
        url:"drive",
        newTab:false,
        inlineTab:true
      },
      {
        key:"campus placement",
        url:"drive",
        newTab:false,
        inlineTab:true
      },
      {
        key:"external job",
        url:"external",
        newTab:false,
        inlineTab:true
      },
      {
        key:"training resources",
        url:"training-resources",
        newTab:false,
        inlineTab:true
      }
    ];
  }).catch(error=>{
    console.log(error.message);
    siteMap=[];
    code=0;
  }).finally(()=>{
    res.json(siteMap);
  });
});

//Get Student Data
data.get("/profile/:user/view",async(req,res)=>{
  const user=await new User(req);
  await user.initialize().then(async data=>{
    if(!data.isLoggedIn)
    {
      throw new Error("Not logged in");
    }
    var userData=await user.getUserData(req.params.user,{
      messages:0
    });
    // console.log(JSON.stringify(userData,null,2));
    if(!userData.success)
    {
      throw new Error("Data fetch error");
    }
    res.render("student/resume",{
      data:userData.result,
      showNavBar:false,
      path:"../"
    });
  }).catch(error=>{
    res.render("/404");
  });
});




module.exports=data;
