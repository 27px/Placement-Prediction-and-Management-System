const express=require("express");
const studentTabs=express.Router();
const User=require("../functions/user.js");
const MongoClient=require("mongodb").MongoClient;
const DB_CONNECTION_URL=require("../config/db.js");
const config=require("../config/config.json");
const chalk=require("chalk");

//Main Home tab in Dashboard of Student
studentTabs.post("/main",async(req,res)=>{
  /////Use Promise.all() to fetch all datas
  const user=new User(req);
  await user.initialize().then(async(data)=>{
    if(data.isLoggedIn && user.hasAccessOf("student"))
    {
      var userData=await user.getUserData(data.user);
      // console.log(JSON.stringify(userData,null,2));


      await MongoClient.connect(DB_CONNECTION_URL,{
        useUnifiedTopology:true
      }).then(async mongo=>{
        var db=await mongo.db(config.DB_SERVER.DB_DATABASE);
        // await db.collection("user_data")
        // .findOne({
        //   email:data.user
        // }).then(dbr=>{
        //   verified=(dbr.otp=="verified");
        // });


        await Promise.all([
          db.collection("user_data").find({type:"recruiter"}).limit(10),
          db.collection("user_data").find({type:"student"}),
          db.collection("user_data").find({
            $or:[
              {
                type:"student"
              },{
                type:"coordinator"
              }
            ]
          })
        ]).then(([a,b,c])=>{
          console.log(a);
          console.log(b);
          console.log(c);

          // await cursor.each((err,item)=>{
          //   if(err!=null || item==null)
          //   {
          //     res.json(department);
          //     cursor.close();
          //     return;
          //   }
          //   else
          //   {
          //     department.push(item);
          //   }
          // });
        }).catch(err=>{
          console.log(chalk.red.inverse("Inner Error"));
          console.log(err.message);
        });


      });



      res.render(`student/dashboard-tabs/main`,{
        email:userData.result.email,
        profilepic:`../data/profilepic/${userData.result.email}.${userData.result.pic_ext}`,
        name:userData.result.data.name,
        course:userData.result.data.admission.course,
        phone:userData.result.data.phone,
        about:userData.result.data.about
      });
    }
    else
    {
      throw new Error("Not Logged In / Don't have access");
    }
  }).catch(error=>{
    console.log(error.message);
    res.end("");
  });
});

//Student Settings
studentTabs.post("/settings",(req,res)=>{
  res.render("student/dashboard-tabs/settings");
});

//Student Profile
studentTabs.post("/profile",(req,res)=>{
  res.render(`student/dashboard-tabs/profile`);
});

//Edit Profile
studentTabs.post("/profile/edit",(req,res)=>{
  res.render("student/dashboard-tabs/edit-profile");
});

//View all Drives
studentTabs.post("/drive",(req,res)=>{
  res.render("student/dashboard-tabs/view-drives");
});

//View Specific Drive
studentTabs.post("/drive/:drive",(req,res)=>{
  var drive=req.params.drive;
  res.render("student/dashboard-tabs/drive",{
    drive
  });
});

//Apply for Specific Drive
studentTabs.post("/drive/:drive/apply",(req,res)=>{
  var drive=req.params.drive;
  res.render("student/dashboard-tabs/apply-for-drive",{
    drive
  });
});

//participate in drive
studentTabs.post("/drive/:drive/round/:round",(req,res)=>{
  var drive=req.params.drive;
  var round=req.params.round;
  res.render("student/dashboard-tabs/participate-in-drive",{
    drive,
    round
  });
});

//skill tracking
studentTabs.post("/skills/tracking",(req,res)=>{
  res.render("student/dashboard-tabs/skill-tracker");
});

//external jobs via api
studentTabs.post("/external",(req,res)=>{
  res.render("student/dashboard-tabs/external-jobs");
});

//recommendation
studentTabs.post("/recommendation",(req,res)=>{
  res.render("student/dashboard-tabs/recommendation");
});

//placement prediction
studentTabs.post("/prediction",async(req,res)=>{
  const NeuralNetwork=require("../neural_network/trained-model.js");

  // Neural Network Loaded

  const user=new User(req);
  await user.initialize().then(async data=>{


    var userData=await user.getUserData(data.user);
    console.log(JSON.stringify(userData,null,2));

    console.log(NeuralNetwork);

    //d["project"],d["intern"],d["extras"],d["arrears"]

    var input=[
      userData.result.data.admission.engineering,//engineering
      userData.result.data.education.sslc.mark/100,//sslc
      userData.result.data.education.plustwo.mark/100//plustwo
    ];
    //Atleast one course will be there
    var ug=0,pg=0;// ug uses cgpa and pg is binary status of yes or no
    userData.result.data.education.course.forEach(course=>{
      if(course.type=="ug")
      {
        if(course.cgpa>ug)
        {
          ug=course.cgpa;
        }
      }
      else if(course.type=="pg")
      {
        pg=1;//not increment, just one
      }
    });
    ug/=10;//cgpa
    input.push(ug);
    input.push(pg);
    var project=0,intern=0;
    userData.result.data.education.experience.forEach(exp=>{
      if(exp.type=="project")
      {
        project++;
      }
      else // job or internship
      {
        intern++;
      }
    });
    project=Math.min(1,project/6); // range 0 to 1
    intern=Math.min(1,intern); // one or zero
    input.push(project);
    input.push(intern);
    var ach=Math.min(1,userData.result.data.education.achievement.length);
    input.push(ach);//extras
    var arrears=(Math.min(1,parseInt(userData.result.data.admission.arrears)/2)*100)/100;
    input.push(arrears);

    console.log(JSON.stringify(userData,null,2))

    console.log(input);
    var percent=NeuralNetwork(input);//predict
    var placement=percent<0.75?false:true;
    percent=parseInt(percent*10000)/100;

    console.log(percent,placement);

    res.render("student/dashboard-tabs/prediction",{
      placement,
      percent
    });
  }).catch(error=>{
    console.log(error.message);
    res.status(500);
    res.end("");
  });
});


module.exports=studentTabs;
