const express=require("express");
const admin=express.Router();
const MongoClient=require("mongodb").MongoClient;
const DB_CONNECTION_URL=require("../config/db.js");
const config=require("../config/config.json");
const User=require("../functions/user.js");
const generatePassword=require("../functions/generatePassword.js");

//Route admin
admin.get("/",(req,res)=>{
  res.redirect("admin/dashboard");
});

//admin Home
admin.get("/dashboard",async(req,res)=>{
  const user=new User(req);
  await user.initialize().then(async data=>{
    if(!data.isLoggedIn)
    {
      throw new Error("Authentication Failed");
    }
    var userData=await user.getUserData(data.user);
    if(!userData.success)
    {
      throw new Error("Authentication Failed . . .");
    }
    if(!user.hasAccessOf("admin"))
    {
      throw new Error("Access Denied");
    }
    res.render("recruiter/dashboard",{
      usertype:userData.result.type,
      email:userData.result.email,
      notifications:userData.result.messages
    });// same for recruiter and admin
  }).catch(error=>{
    console.log(error.message);
    res.redirect("/login");
  });
});


// Create Company Account Backend
admin.post("/dashboard/add-company-data",async(req,res)=>{
  const user=new User(req);
  await user.initialize().then(async data=>{
    if(data.isLoggedIn && user.hasAccessOf("admin"))
    {
      await MongoClient.connect(DB_CONNECTION_URL,{
        useUnifiedTopology:true
      }).then(async mongo=>{
        var db=await mongo.db(config.DB_SERVER.DB_DATABASE);
        var data_collection=await db.collection("user_data");
        data_collection.findOne({
          email:req.body.email
        }).then(async result=>{
          if(result!=null)
          {
            throw new Error("Email exists");
          }
          else
          {
            data_collection.insertOne({
              email:req.body.email,
              data:{
                name:req.body.name,
                website:req.body.website
              },
              type:"recruiter",
              pic_ext:"",
              password:Buffer.from(generatePassword()).toString("base64"),
              messages:[]
            }).then(re=>{
              ////send mail
              res.json({

              });
            });
          }
        });
      })
    }
    else
    {
      throw new Error("Not Authorized");
    }
  }).catch(error=>{
    console.log(error.message);
    res.json({
      success:false,
      message:error.message
    });
  });
});


admin.post("/dashboard/:tab",async(req,res)=>{
  const user=new User(req);
  await user.initialize().then(async data=>{
    if(!data.isLoggedIn)
    {
      throw new Error("Authentication Failed");
    }
    var userData=await user.getUserData(data.user);
    if(!userData.success)
    {
      throw new Error("Authentication Failed . . .");
    }
    if(!user.hasAccessOf("admin"))
    {
      throw new Error("Access Denied");
    }
    res.render(`admin/${req.params.tab}`,{
      notifications:userData.result.messages
    });// same for recruiter and admin
  }).catch(error=>{
    console.log(error.message);
    res.end("");
  });
});


//Manage Students
admin.get("/students/modify",(req,res)=>{
  res.render("admin/manage-students");
});

//Alumni data
admin.get("/alumni",(req,res)=>{
  res.render("alumni");
});

//configurations
admin.get("/configurations",(req,res)=>{
  res.render("admin/configurations");
});

//Dump data
admin.get("/dump/data",(req,res)=>{
  res.render("admin/dump-data");
});

//Manage Coordinators
admin.get("/coordinators/modify",(req,res)=>{
  res.render("admin/manage-coordinators");
});

//Create Company Account
admin.get("/add-company",(req,res)=>{
  res.render("admin/add-company");
});

//Report Generation
admin.get("/report/generate",(req,res)=>{
  res.render("admin/generate-report");
});

module.exports=admin;
