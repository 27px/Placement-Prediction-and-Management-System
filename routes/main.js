const express=require("express");
const route=express.Router();
const cookieParser=require("cookie-parser");
const student=require("./student");
const coordinator=require("./coordinator");
const recruiter=require("./recruiter");
const admin=require("./admin");
const data=require("./data");// statistics, sitemap and other data
const MongoClient=require("mongodb").MongoClient;
const DB_CONNECTION_URL=require("../config/db.js");
const config=require("../config/config.json");
const User=require("../functions/user.js");
const nodemailer=require('nodemailer');
const mail_credentials=require("../config/mail.js");
const getResultFromCursor=require("../functions/getResultFromCursor.js");
const mailResetPasswordOtp=require("../functions/mail_reset_password_otp.js");
const generatePassword=require("../functions/generatePassword.js");
const fs=require("fs");//for gallery
const path=require("path");

route.use(cookieParser());

//Main Root
route.get("/",(req,res)=>{
  res.redirect("/home");
});

//Main Home
route.get("/home",async(req,res)=>{
  const user=await new User(req);
  var isLoggedIn,type;
  await user.initialize().then(data=>{
    isLoggedIn=data.isLoggedIn,
    type=data.type
  }).catch(error=>{
    console.log(error.message);
    isLoggedIn=false,
    type="guest"
  }).finally(()=>{
    res.render("home",{
      isLoggedIn,
      type
    });
  });
});

//Login
route.get("/login",async(req,res)=>{
  const user=await new User(req);
  var state={
    login:"visible",
    register:"hidden"
  };
  await user.initialize().then(data=>{
    state.isLoggedIn=data.isLoggedIn;
    state.type=data.type;
  }).catch(error=>{
    console.log(error.message);
    state.isLoggedIn=false;
    state.type="guest";
  }).finally(()=>{
    res.render("login-signup",state);
  });
});

//New Account
route.get("/register",async(req,res)=>{
  const user=await new User(req);
  var state={
    login:"hidden",
    register:"visible"
  };
  await user.initialize().then(data=>{
    state.isLoggedIn=data.isLoggedIn;
    state.type=data.type;
  }).catch(error=>{
    console.log(error.message);
    state.isLoggedIn=false;
    state.type="guest";
  }).finally(()=>{
    res.render("login-signup",state);
  });
});

//process Login
route.post("/login",(req,res)=>{
  var parseError=false;
  var data={};//response data
  var userCreadentials;
  try
  {
    userCredentials=Buffer.from(req.body.raw,"base64").toString("binary");
    userCredentials=JSON.parse(userCredentials);
  }
  catch(error)//Parse Error
  {
    console.log(error.message);
    parseError=true;
    data.success=false;
    data.message="Invalid request";
    data.devlog=error.message;
    res.json(data);
  }
  if(!parseError)//else part of try catch (no parse error)
  {
    var {password,email,remember}=userCredentials;
    password=Buffer.from(password).toString("base64");
    MongoClient.connect(DB_CONNECTION_URL,{
      useUnifiedTopology:true
    }).then(async mongo=>{
      const db=await mongo.db(config.DB_SERVER.DB_DATABASE);
      db.collection("user_data")
      .findOne({
        email,
        password
      })
      .then(result=>{
        if(result!==null)
        {
          req.session.user=email;
          req.session.type=result.type;
          data.success=true;
          // console.log(result);
          if(result.data==undefined && (result.type=="student" || result.type=="coordinator"))
          {
            data.redirect='student/profile/new';//If (student/coordinator) profile not complete
          }
          else if(result.type=="coordinator")
          {
            data.redirect=`/student/dashboard`;//coordinator is also student
          }
          else
          {
            data.redirect=`/${result.type}/dashboard`;
          }
          if(remember===true)
          {
            var key=config.COOKIE.KEY;
            var value={
              u:email,
              p:password
            };
            value=JSON.stringify(value);
            value=Buffer.from(value).toString("base64");
            var option={
              maxAge:31*24*60*60*1000
            };
            res.cookie(key,value,option);//set cookie
          }
          else
          {
            res.cookie(key,"",{maxAge:0});//delete cookie
          }
        }
        else
        {
          data.success=false;
          data.message="Invalid credentials";
        }
      }).catch(err=>{
        console.log(err.message);
        data.success=false;
        data.message="Invalid data";
        data.devlog=err.message;
        // res.json(data);
      }).finally(()=>{
        mongo.close();
        res.json(data);
      });
    }).catch(error=>{
      console.log(error.message);
      data.success=false;
      data.message="Connection Error";
      data.devlog=error.message;
      res.json(data);
    });
  }
});

//process registration
route.post("/register",(req,res)=>{
  var parseError=false;
  var data={};//response data
  var userCreadentials;
  try
  {
    userCredentials=Buffer.from(req.body.raw,"base64").toString("binary");
    userCredentials=JSON.parse(userCredentials);
  }
  catch(error)
  {
    console.log(error.message);
    parseError=true;
    data.success=false;
    data.message="Invalid request";
    data.devlog=error.message;
  }
  if(!parseError)//else part of try catch
  {
    var {password,email}=userCredentials;
    password=Buffer.from(password).toString("base64");
    MongoClient.connect(DB_CONNECTION_URL,{
      useUnifiedTopology:true
    }).then(async mongo=>{
      const db=await mongo.db(config.DB_SERVER.DB_DATABASE);
      //Checks if user already exists
      db.collection("user_data")
      .findOne({
        email
      })
      .then(result=>{
        if(result===null)
        {
          db.collection("user_data")
          .insertOne({
            email,
            password,
            type:"student",
            messages:[]
          },(err,retval)=>{
            if(err!==null)
            {
              data.success=false;
              data.message="Create failed";
              data.devlog=err.message;
              res.json(data);
            }
            else
            {
              data.success=true;
              data.redirect="student/profile/new";//send to complete profile page after creating account
              res.json(data);
            }
            mongo.close();
          });
        }
        else
        {
          data.success=false;
          data.message="E-Mail Id exists";
          res.json(data);
        }
      }).catch(err=>{
        console.log(err.message);
        data.success=false;
        data.message="Unknown Error";
        data.devlog=err.message;
        res.json(data);
      });
    }).catch(error=>{
      console.log(error.message);
      data.success=false;
      data.message="Connection Error";
      data.devlog=error.message;
      res.json(data);
    });
  }
});

//Logout
route.get("/logout",(req,res)=>{
  var redirect="home";
  if(req.query.to!==undefined)
  {
    redirect=req.query.to;
  }
  req.session.destroy();
  res.cookie(config.COOKIE.KEY,"",{maxAge:0});
  res.redirect(redirect);
});

//Reset Password UI
route.get("/reset/password",async(req,res)=>{
  var type="guest";
  var isLoggedIn=false;
  const user=await new User(req);
  await user.initialize()
  .then(data=>{
    type=data.type;
    isLoggedIn=data.isLoggedIn;
  }).catch(err=>{
    type="guest";
    isLoggedIn=false;
  }).finally(()=>{
    res.render("reset-password",{
      type,
      isLoggedIn
    });
  });
});

//Reset Password OTP
route.post("/reset/password/otp",async(req,res)=>{
  const user=await new User(req);
  //only need to check if user exists, no data is needed
  user.getUserData(req.body.email,{
    "_id":1
  }).then(async(data)=>{
    if(!data.success)
    {
      throw {
        name:"customError",
        message:"Email not registered"
      };
    }
    else
    {
      return Promise.all([
        nodemailer.createTransport(mail_credentials),
        MongoClient.connect(DB_CONNECTION_URL,{useUnifiedTopology:true})
      ]);
    }
  }).then(async([transporter,mongo])=>{
    const otp=generatePassword();//key to reset password
    const db=await mongo.db(config.DB_SERVER.DB_DATABASE);
    return Promise.all([
      transporter.sendMail({
        from:"Placement Manager",
        to:req.body.email,
        subject:'Reset Password',
        html:mailResetPasswordOtp(otp)
      }),
      db.collection("user_data")
      .updateOne({
        email:req.body.email
      },{
        $set:{
          resetPassword:{
            otp,
            generated:Date.now()
          }
        }
      })
    ]);
  }).then(async([sent,updated])=>{
    if(sent.accepted.length<1)
    {
      throw {
        name:"customError",
        message:"Email sent Error"
      };
    }
    else if(updated.result.n<1)
    {
      throw {
        name:"customError",
        message:"OTP save Error"
      };
    }
    else
    {
      res.json({
        success:true
      });
    }
  }).catch(err=>{
    console.log(err.message);
    res.json({
      success:false,
      message:err.name=="customError"?err.message:"Unknown Error"
    });
  });
});

//Reset Password
route.post("/reset/password",async(req,res)=>{
  var {email,otp,password}=req.body;
  MongoClient.connect(DB_CONNECTION_URL,{
    useUnifiedTopology:true
  }).then(async mongo=>{
    const db=await mongo.db(config.DB_SERVER.DB_DATABASE);
    return db.collection("user_data")
    .updateOne({
      email,
      "resetPassword.otp":otp,
      "resetPassword.generated":{
        $gt:(new Date()-(10*60*1000))
      }
    },
    {
      $set:{
        password:Buffer.from(password).toString("base64")
      },
      $unset:{
        resetPassword:""
      }
    });
  }).then(result=>{
    if(result.matchedCount<1)
    {
      throw new Error("Invalid data");
    }
    else
    {
      res.json({
        success:true
      });
    }
  }).catch(err=>{
    console.log(err.message);
    res.json({
      success:false,
      message:err.message
    });
  });
});

//About
route.get("/about",async(req,res)=>{
  var type="guest";
  var isLoggedIn=false;
  const user=await new User(req);
  await user.initialize()
  .then(data=>{
    type=data.type;
    isLoggedIn=data.isLoggedIn;
  }).catch(err=>{
    type="guest";
    isLoggedIn=false;
  }).finally(()=>{
    res.render("about",{
      type,
      isLoggedIn
    });
  });
});

//help / contact / feedback / bug report
route.get("/contact",async(req,res)=>{
  var type="guest";
  var isLoggedIn=false;
  var email="";
  const user=await new User(req);
  await user.initialize()
  .then(data=>{
    type=data.type;
    isLoggedIn=data.isLoggedIn;
    email=isLoggedIn?data.user:"";
  }).catch(error=>{
    console.log(error.message);
    type="guest";
    isLoggedIn=false;
    email="";
  }).finally(()=>{
    res.render("contact",{
      type,
      isLoggedIn,
      email,
      error:""
    });
  });
});

//send message
route.post("/contact",async(req,res)=>{
  const user=await new User(req);
  var err=false;
  await user.initialize()
  .then(async data=>{
    isLoggedIn=data.isLoggedIn;
    email=isLoggedIn?data.user:req.body.email;
    await MongoClient.connect(DB_CONNECTION_URL,{
      useUnifiedTopology:true
    }).then(async mongo=>{
      const db=await mongo.db(config.DB_SERVER.DB_DATABASE);
      await db.collection("user_data")
      .updateOne({
        type:"admin"
      },{
        $push:{
          messages:{
            from:email,
            name:req.body.name,
            type:req.body.type,
            message:req.body.message,
            date:Date.now()
          }
        }
      }).then(d=>{
        // console.log(d);
      });
    });
  }).catch(error=>{
    console.log(error.message);
    err=true;
  }).finally(()=>{
    if(err)
    {
      res.render("contact",{
        type,
        isLoggedIn,
        email,
        error:"Couldn't send Message"
      });
    }
    else
    {
      res.redirect("/home");
    }
  });
});

//Gallery
route.get("/gallery",async(req,res)=>{
  const dir=path.join(__dirname,"../data/gallery");
  var isLoggedIn,type;
  const user=await new User(req);
  await user.initialize().then(data=>{
    isLoggedIn=data.isLoggedIn;
    type=data.type;
  }).catch(error=>{
    console.log(error.message);
    isLoggedIn=false;
    type="guest";
  }).finally(()=>{
    fs.readdir(dir,(err,files)=>{
      if(err)
      {
        files=[];
      }
      res.render("gallery",{
        files,
        isLoggedIn,
        type
      });
    });
  });
});

//Gallery Image Upload
route.post("/gallery/upload",async(req,res)=>{
  var isLoggedIn,type,result={};
  const user=await new User(req);
  await user.initialize().then(data=>{
    isLoggedIn=data.isLoggedIn;
    type=data.type;
  }).catch(error=>{
    console.log(error.message);
    isLoggedIn=false;
    type="guest";
  }).finally(async()=>{
    if(isLoggedIn && ["coordinator","admin"].includes(type))
    {
      if(req.files!=undefined)
      {
        if(req.files.image!=undefined && req.body.title!="")
        {
          var fname=`${__dirname}/../data/gallery/${req.body.title}.${req.files.image.name.split(".").pop()}`;
          await req.files.image.mv(fname).then(()=>{
            result.success=true;
          }).catch(err=>{
            console.log(err.message);
            result.success=false;
            result.message="Couldn't Upload Image";
            result.devlog=err.message;
          });
        }
        else
        {
          result.success=false;
          result.message="Image not Uploaded";
        }
      }
      else
      {
        result.success=false;
        result.message="No files Uploaded";
      }
    }
    else
    {
      result.success=false;
      result.message="Not Logged in";
    }
  });
  res.json(result);
});

//view statistics
route.get("/statistics",async(req,res)=>{
  var isLoggedIn=false;
  var type="guest"
  const user=await new User(req);
  await user.initialize().then(async(data)=>{
    isLoggedIn=data.isLoggedIn;
    type=data.type;
    await MongoClient.connect(DB_CONNECTION_URL,{
      useUnifiedTopology:true
    }).then(async mongo=>{
      var db=await mongo.db(config.DB_SERVER.DB_DATABASE);
      var stat=await db.collection("statistical_data").aggregate([
        {
          $sort:{
            year:1
          }
        }
      ]);
      getResultFromCursor(stat)
      .then(statistics=>{
        res.render(`statistics`,{
          isLoggedIn,
          type,
          email:user.user,
          statistics
        });
      });
    });
  }).catch(error=>{
    console.log(error.message);
    res.redirect("/login");
  });
});

//placement cell members
route.get("/team",async(req,res)=>{
  var isLoggedIn=false;
  var type="guest"
  const user=await new User(req);
  await user.initialize().then(async(data)=>{
    isLoggedIn=data.isLoggedIn;
    type=data.type;
    await MongoClient.connect(DB_CONNECTION_URL,{
      useUnifiedTopology:true
    }).then(async mongo=>{
      var db=await mongo.db(config.DB_SERVER.DB_DATABASE);
      var coordinators=await db.collection("user_data").aggregate([
        {
          $match:{
            type:"coordinator"
          }
        },
        {
          $project:{
            email:1,
            "data.name":1,
            "data.about":1,
            "data.admission.course":1,
            "pic_ext":1
          }
        }
      ]);
      getResultFromCursor(coordinators)
      .then(coordinators=>{
        res.render(`placement-cell-members`,{
          isLoggedIn,
          type,
          email:user.user,
          coordinators
        });
      });
    });
  }).catch(error=>{
    console.log(error.message);
    res.redirect("/login");
  });
});

//Student Route
route.use("/student",student);

//Coordinator Route
route.use("/coordinator",coordinator);

//Coordinator Route
route.use("/recruiter",recruiter);

//admin Route
route.use("/admin",admin);

//Get non html data for displaying
route.use("/data",data);

//Not Found
route.get("/404",function(req,res){
  res.status(404);
  res.render("404");
});

//All other routes
route.get("*",function(req,res){
  //logs requested path
  console.log(`404 : ${req.originalUrl}`);
  res.redirect("/404");
});

module.exports=route;
