const express=require("express");
const admin=express.Router();
const MongoClient=require("mongodb").MongoClient;
const DB_CONNECTION_URL=require("../config/db.js");
const config=require("../config/config.json");
const User=require("../functions/user.js");
const generatePassword=require("../functions/generatePassword.js");
const setMailWelcomeRecruiter=require("../functions/mail_recruiter_welome.js");
const getResultFromCursor=require("../functions/getResultFromCursor.js");
const nodemailer=require("nodemailer");
const mail_credentials=require("../config/mail.js");

//Route admin
admin.get("/",(req,res)=>{
  res.redirect("admin/dashboard");
});

//admin Home
admin.get("/dashboard",async(req,res)=>{
  const user=await new User(req);
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
  const user=await new User(req);
  var ret={};
  var password=generatePassword();
  await user.initialize().then(async data=>{
    if(data.isLoggedIn && user.hasAccessOf("admin"))
    {
      await MongoClient.connect(DB_CONNECTION_URL,{
        useUnifiedTopology:true
      }).then(async mongo=>{
        var db=await mongo.db(config.DB_SERVER.DB_DATABASE);
        var data_collection=await db.collection("user_data");
        await data_collection.findOne({
          email:req.body.email
        }).then(async result=>{
          if(result!=null)
          {
            ret.success=false;
            ret.message="Email exists";
          }
          else
          {
            await data_collection.insertOne({
              email:req.body.email,
              data:{
                name:req.body.name,
                website:req.body.website
              },
              type:"recruiter",
              password:Buffer.from(password).toString("base64"),
              messages:[]
            }).then(async _=>{
              var transporter=await nodemailer.createTransport(mail_credentials);
              await transporter.sendMail({
                from:"Placement Manager",
                to:req.body.email,
                subject:'Recruiter Account Created',
                html:setMailWelcomeRecruiter(password)
              }).then(async sent=>{
                console.log(sent);
                ret.success=true;
                ret.redirect=`./dashboard`;
                delete ret.message;
              });
            });
          }
        });
      })
    }
    else
    {
      ret.success=false;
      ret.message="Not Authorized";
    }
  }).catch(error=>{
    console.log(error.message);
    ret.success=false;
    ret.message=error.message;
  }).finally(()=>{
    res.json(ret);
  });
});

// //Manage Students
// admin.get("/students/modify",(req,res)=>{
//   res.render("admin/manage-students");
// });

// //Alumni data
// admin.get("/alumni",(req,res)=>{
//   res.render("alumni");
// });

// //configurations
// admin.get("/configurations",(req,res)=>{
//   res.render("admin/configurations");
// });

//Dump data
admin.get("/dump/data",(req,res)=>{
  res.render("admin/dump-data");
});

//Add course
admin.post("/dashboard/add-course",async(req,res)=>{
  const user=await new User(req);
  await user.initialize().then(data=>{
    if(data.isLoggedIn && user.hasAccessOf("admin"))
    {
      return MongoClient.connect(DB_CONNECTION_URL,{
        useUnifiedTopology:true
      })
    }
    else
    {
      throw new Error("Access Denied");
    }
  }).then(async mongo=>{
    var db=await mongo.db(config.DB_SERVER.DB_DATABASE);
    var data_collection=await db.collection("department");
    return getResultFromCursor(await data_collection.aggregate([
      {
        "$project":{
          _id:0,
          name:1
        }
      }
    ]));
  }).then(result=>{
      var department=result!=null?result.map(x=>x.name):[];
      res.render("admin/add-course",{
        department
      });
  }).catch(err=>{
    console.log(err.message);
    res.status(500);
    res.end();
  });
});

//Add Department
admin.post("/add-department",(req,res)=>{
  res.render("admin/add-department");
});

//select Coordinators from students
admin.get("/select-coordinators/",(req,res)=>{
  res.render("admin/select-coordinators");
});

//Create Company Account
admin.get("/add-company",(req,res)=>{
  res.render("admin/add-company");
});

//Report Generation
// admin.get("/report/generate",(req,res)=>{
//   res.render("admin/generate-report");
// });

//Other tabs
admin.post("/dashboard/:tab",async(req,res)=>{
  const user=await new User(req);
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


module.exports=admin;
