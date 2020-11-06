const express=require("express");
const route=express.Router();
const cookieParser=require("cookie-parser");
const student=require("./student");
const coordinator=require("./coordinator");
const recruiter=require("./recruiter");
const administrator=require("./administrator");
const data=require("./data");// statistics, sitemap and other data
const MongoClient=require("mongodb").MongoClient;
const DB_CONNECTION_URL=require("../config/db.js");
const config=require("../config/config.json");
const User=require("../functions/user.js");
const fs=require("fs");
const path=require("path");

route.use(cookieParser());

//Main Root
route.get("/",(req,res)=>{
  res.redirect("/home");
});

//Main Home
route.get("/home",(req,res)=>{
  const user=new User(req.session);
  res.render("home",{
    loggedin:user.isLoggedIn,
    type:user.type
  });
});



// route.get("/test",(req,res)=>{
//
//   //get cookie
//   console.log(req.cookies);
//
//   //setCookie
//   res.cookie('user','rahulr0047@gmail.com',{
//     secure:false
//   });
//
//   res.end("200");
// });


//Login
route.get("/login",(req,res)=>{
  const user=new User(req.session);
  res.render("login-signup",{
    login:"visible",
    register:"hidden",
    loggedin:user.isLoggedIn,
    type:user.type
  });// hide register
});

//New Account
route.get("/register",(req,res)=>{
  const user=new User(req.session);
  res.render("login-signup",{
    login:"hidden",
    register:"visible",
    loggedin:user.isLoggedIn,
    type:user.type
  });//hide login
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
    }).then(mongo=>{
      const db=mongo.db(config.DB_SERVER.DB_DATABASE);
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
          data.redirect=`/${result.type}/dashboard`;
          // res.json(data);
        }
        else
        {
          data.success=false;
          data.message="Invalid credentials";
          // res.json(data);
        }
      }).catch(err=>{
        data.success=false;
        data.message="Invalid data";
        data.devlog=error.message;
        // res.json(data);
      }).finally(()=>{
        mongo.close();
        res.json(data);
      });
    }).catch(error=>{
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
    }).then(mongo=>{
      const db=mongo.db(config.DB_SERVER.DB_DATABASE);
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
            type:"student"
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
              data.redirect="/login";//send to login after create account
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
        data.success=false;
        data.message="Unknown Error";
        data.devlog=err.message;
        res.json(data);
      });
    }).catch(error=>{
      data.success=false;
      data.message="Connection Error";
      data.devlog=error.message;
      res.json(data);
    });
  }
});

//Logout
route.get("/logout",(req,res)=>{
  req.session.destroy();
  //todo clear cookies
  res.redirect("home");
});

//Reset Password
route.get("/reset/password",(req,res)=>{
  res.render("reset-password");
});

//About
route.get("/about",(req,res)=>{
  res.render("about");
});

//help / contact / feedback
route.get("/contact",(req,res)=>{
  res.render("contact");
});

//Gallery
route.get("/gallery",(req,res)=>{
  const dir=path.join(__dirname,"../data/gallery");
  const user=new User(req.session);
  fs.readdir(dir,(err,files)=>{
    if(!err)
    {
      res.render("gallery",{
        files,
        loggedin:user.isLoggedIn,
        type:user.type
      });
    }
    else
    {
      res.render("gallery",{
        files:[],
        loggedin:user.isLoggedIn,
        type:user.type
      });
    }
  });
});

//Resources
route.get("/resources",(req,res)=>{
  res.render("resources");
});

//view statistics
route.get("/statistics",(req,res)=>{
  res.render("statistics");
});

//placement cell members
route.get("/team",(req,res)=>{
  res.render("placement-cell-members");
});

//Profile
route.get("/profile",(req,res)=>{

  //Important
  var user="student";//Hardcoded - change when db is implemented

  if(user!="administrator")
  {
    res.redirect(`${user}/dashboard?tab=profile`);
  }
  else
  {
    res.redirect("/404");
  }
});

//Student Route
route.use("/student",student);

//Coordinator Route
route.use("/coordinator",coordinator);

//Coordinator Route
route.use("/recruiter",recruiter);

//Administrator Route
route.use("/administrator",administrator);

//Get non html data for displaying
route.use("/data",data);

//Not Found
route.get("/404",function(req,res){
  res.status(404);
  res.render("404");
});

//All other routes
route.get("*",function(req,res){
  res.redirect("/404");
});

module.exports=route;
