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
const dumpData=require("./dump-data");

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
    var userData=await user.getUserData(data.user,{
      "type":1,
      "email":1,
      "messages":1
    });
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
                // console.log(sent);
                ret.success=true;
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

//Manage Students
admin.post("/student/add/:email/coordinator",async(req,res)=>{
  var email=req.params.email;

  const user=await new User(req);
  var ret={};
  user.initialize().then(async data=>{
    if(data.isLoggedIn && user.hasAccessOf("admin"))
    {
      return user.getUserData(email,{"type":1});
    }
    else
    {
      throw new Error("Not Authorized");
    }
  }).then(studentInfo=>{
    if(!studentInfo.success)
    {
      throw new Error("User does not exist");
    }
    if(studentInfo.result.type!="student")
    {
      throw new Error("User is not a student");
    }
    else
    {
      return MongoClient.connect(DB_CONNECTION_URL,{
        useUnifiedTopology:true
      });
    }
  }).then(mongo=>{
    return mongo.db(config.DB_SERVER.DB_DATABASE);
  }).then(db=>{
    return db.collection("user_data");
  }).then(data_collection=>{
    return data_collection.updateOne({
      email
    },{
      $set:{
        type:"coordinator"
      }
    })
  }).then(result=>{
    if(result.modifiedCount!=1)
    {
      throw new Error("Something went wrong");
    }
    else
    {
      ret.success=true;
    }
  }).catch(error=>{
    console.log(error.message);
    ret.success=false;
    ret.message=error.message;
  }).finally(()=>{
    res.json(ret);
  });
});

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
  await user.initialize()
  .then(data=>{
    if(data.isLoggedIn && user.hasAccessOf("admin"))
    {
      return MongoClient.connect(DB_CONNECTION_URL,{
        useUnifiedTopology:true
      });
    }
    else
    {
      throw new Error("Access Denied");
    }
  }).then(mongo=>{
    return mongo.db(config.DB_SERVER.DB_DATABASE);
  }).then(db=>{
    return db.collection("department");
  }).then(data_collection=>{
    return data_collection.aggregate([
      {
        "$project":{
          _id:0,
          name:1
        }
      }
    ]);
  }).then(cursor=>{
    return getResultFromCursor(cursor);
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

//Add Course form handling
admin.post("/add-course/add",async(req,res)=>{
  const user=await new User(req);
  await user.initialize()
  .then(data=>{
    if(data.isLoggedIn && user.hasAccessOf("admin"))
    {
      return MongoClient.connect(DB_CONNECTION_URL,{
        useUnifiedTopology:true
      });
    }
    else
    {
      throw new Error("Access Denied");
    }
  }).then(mongo=>{
    return mongo.db(config.DB_SERVER.DB_DATABASE);
  }).then(db=>{
    return db.collection("department");
  }).then(department=>{
    return department.findOne({
      name:new RegExp(`^${req.body.department}$`,"i"),
      courses:{
        $elemMatch:{
          name:req.body.course
        }
      }
    });
  }).then(department=>{
    if(department===null)
    {
      return MongoClient.connect(DB_CONNECTION_URL,{
        useUnifiedTopology:true
      });
    }
    else
    {
      res.json({
        success:false,
        message:"Course already exists"
      });
    }
  }).then(mongo=>{
    if(mongo!=undefined)
    {
      return mongo.db(config.DB_SERVER.DB_DATABASE);
    }
  }).then(db=>{
    if(db!=undefined)
    {
      return db.collection("department");
    }
  }).then(department=>{
    if(department!=null)
    {
      return department.updateOne({
        name:req.body.department
      },{
        "$push":{
          courses:{
            name:req.body.course,
            num_of_sem:req.body.num
          }
        }
      });
    }
  }).then(resp=>{
    if(resp!=undefined)
    {
      if(resp.modifiedCount!=1)
      {
        throw new Error("Update Error");
      }
      else
      {
        res.json({
          success:true
        });
      }
    }
  }).catch(err=>{
    console.log(err.message);
    res.status(500);
    res.end();
  });
});

//Add Department ui
admin.post("/add-department",(req,res)=>{
  res.render("admin/add-department");
});

//add department form handling
admin.post("/add-department/add",async(req,res)=>{
  const user=await new User(req);
  await user.initialize()
  .then(data=>{
    if(data.isLoggedIn && user.hasAccessOf("admin"))
    {
      return MongoClient.connect(DB_CONNECTION_URL,{
        useUnifiedTopology:true
      });
    }
    else
    {
      throw new Error("Access Denied");
    }
  }).then(mongo=>{
    return mongo.db(config.DB_SERVER.DB_DATABASE);
  }).then(db=>{
    return db.collection("department");
  }).then(department=>{
    return department.findOne({
      name:new RegExp(`^${req.body.department}$`,"i")
    });
  }).then(department=>{
    if(department===null)
    {
      return MongoClient.connect(DB_CONNECTION_URL,{
        useUnifiedTopology:true
      });
    }
    else
    {
      res.json({
        success:false,
        message:"Department already exists"
      });
    }
  }).then(mongo=>{
    if(mongo!=undefined)
    {
      return mongo.db(config.DB_SERVER.DB_DATABASE);
    }
  }).then(db=>{
    if(db!=undefined)
    {
      return db.collection("department");
    }
  }).then(department=>{
    if(department!=null)
    {
      return department.insertOne({
        name:req.body.department,
        courses:[],
        engineering:req.body.type
      });
    }
  }).then(resp=>{
    if(resp!=undefined)
    {
      if(resp.insertedCount!=1)
      {
        throw new Error("Insert Error");
      }
      else
      {
        res.json({
          success:true
        });
      }
    }
  }).catch(err=>{
    console.log(err.message);
    res.status(500);
    res.end();
  });
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

admin.post("/dashboard/schedule",async(req,res)=>{
  const user=await new User(req);
  await user.initialize().then(async data=>{
    if(!data.isLoggedIn)
    {
      throw new Error("Authentication Failed");
    }
    if(!user.hasAccessOf("admin"))
    {
      throw new Error("Access Denied");
    }
    return MongoClient.connect(DB_CONNECTION_URL,{
      useUnifiedTopology:true
    });
  }).then(mongo=>{
    return mongo.db(config.DB_SERVER.DB_DATABASE);
  }).then(db=>{
    return db.collection("user_data");
  }).then(user_data=>{
    return user_data.aggregate([
      {
        "$match":{
          type:"recruiter",
          "data.job.schedule.recruiteraccepted":true,
          "data.job.schedule.adminaccepted":false
        }
      },
      {
        "$project":{
          _id:0,
          email:1,
          "data.name":1,
          "data.job.title":1,
          "data.job.salary":1,
          "data.job.vacancy":1,
          "data.job.schedule.date":1
        }
      }
    ]);
  }).then(resp=>{
    return getResultFromCursor(resp);
  }).then(companies=>{
    companies=companies.length>0?companies:[];
    res.render(`admin/schedule`,{
      companies
    });
  }).catch(error=>{
    console.log(error.message);
    res.end("");
  });
});

admin.post("/dashboard/schedule/:company/approve",async(req,res)=>{
  const user=await new User(req);
  await user.initialize().then(async data=>{
    if(!data.isLoggedIn)
    {
      throw new Error("Authentication Failed");
    }
    if(!user.hasAccessOf("admin"))
    {
      throw new Error("Access Denied");
    }
    return MongoClient.connect(DB_CONNECTION_URL,{
      useUnifiedTopology:true
    });
  }).then(mongo=>{
    return mongo.db(config.DB_SERVER.DB_DATABASE);
  }).then(db=>{
    return db.collection("user_data");
  }).then(user_data=>{
    return user_data.updateOne({
      email:req.params.company
    },{
      "$set":{
        "data.job.schedule.adminaccepted":true
      },
      "$push":{
        "messages":{
          from:req.session.user,
          name:"Admin",
          message:"Your schedule request has been accepted to conduct on the requested date. Go to Schedule Section to see details.",
          type:"general",
          date:new Date()
        }
      }
    });
  }).then(resp=>{
    if(resp.modifiedCount==1)
    {
      res.json({
        success:true
      });
    }
    else
    {
      res.json({
        success:false,
        message:"Something went wrong"
      });
    }
  }).catch(error=>{
    console.log(error.message);
    res.json({
      success:false
    });
  });
});

//Other tabs
admin.post("/dashboard/:tab",async(req,res)=>{
  const user=await new User(req);
  await user.initialize().then(async data=>{
    if(!data.isLoggedIn)
    {
      throw new Error("Authentication Failed");
    }
    if(!user.hasAccessOf("admin"))
    {
      throw new Error("Access Denied");
    }
    var notifications=[];
    if(req.params.tab=="main")//notifications are only used in main page
    {
      var userData=await user.getUserData(data.user,{
        "messages":1
      });
      if(!userData.success)
      {
        throw new Error("Authentication Failed . . .");
      }
      notifications=userData.result.messages;
    }
    res.render(`admin/${req.params.tab}`,{
      notifications
    });
  }).catch(error=>{
    console.log(error.message);
    res.end("");
  });
});


//Get non html data for displaying
admin.use("/dump-data",dumpData);


module.exports=admin;
