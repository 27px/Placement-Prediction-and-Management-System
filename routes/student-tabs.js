const express=require("express");
const studentTabs=express.Router();
const User=require("../functions/user.js");
const MongoClient=require("mongodb").MongoClient;
const DB_CONNECTION_URL=require("../config/db.js");
const fetch=require("node-fetch");
const config=require("../config/config.json");
const stripHTML=require("string-strip-html");
const purifyDescription=require("../functions/purifyDescription.js");
const mostRepeated=require("../functions/mostRepeated.js");
const notInEnglishWords=require("../functions/notInEnglishWords.js");
const getResultFromCursor=require("../functions/getResultFromCursor.js");
const chalk=require("chalk");

//Main Home tab in Dashboard of Student
studentTabs.post("/main",async(req,res)=>{
  const user=await new User(req);
  await user.initialize().then(async(data)=>{
    if(data.isLoggedIn && user.hasAccessOf("student"))
    {
      var userData=await user.getUserData(data.user);
      await MongoClient.connect(DB_CONNECTION_URL,{
        useUnifiedTopology:true
      }).then(async mongo=>{
        var db=await mongo.db(config.DB_SERVER.DB_DATABASE);
        await Promise.all([
          db.collection("user_data")
          .aggregate([
            {
              $match:{
                type:"recruiter",
                "data.job":{
                  $exists:true
                }
              },
            },
            {
              $project:{
                "data.name":1,
                "data.website":1,
                "data.job.salary":1,
                "data.job.vacancy":1,
                "data.job.title":1,
                "data.job.type":1
              }
            },
            {
              $addFields:{
                rank:{
                  $add:[
                    {
                      $divide:[
                        "$data.job.salary",
                        1000
                      ]
                    },
                    "$data.job.vacancy"
                  ]
                }
              }
            },
            {
              $sort:{
                rank:-1,
                "data.job.salary":-1
              }
            }
          ]).limit(10),
          db.collection("user_data").aggregate([
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
          ]),
          db.collection("user_data").aggregate([
            {
              "$match":{$or:[{"type":"student"},{"type":"coordinator"}]},
            },
            {
              "$group":{
                _id:"$data.admission.course",
                count:{
                  $sum:1
                }
              }
            },
            {
              "$sort":{count:1}
            }
          ])
        ]).then(([a,b,c])=>{
          return Promise.all([
            getResultFromCursor(a),
            getResultFromCursor(b),
            getResultFromCursor(c)
          ]);
        }).then(([companies,coordinators,department])=>{
          res.render(`student/dashboard-tabs/main`,{
            email:userData.result.email,
            profilepic:`../data/profilepic/${userData.result.email}.${userData.result.pic_ext}`,
            name:userData.result.data.name,
            course:userData.result.data.admission.course,
            phone:userData.result.data.phone,
            about:userData.result.data.about,
            messages:userData.result.messages,
            companies,
            coordinators,
            department
          });
        });
      });
    }
    else
    {
      throw new Error("Not Logged In / Don't have access");
    }
  }).catch(error=>{
    console.log(error.message);
    res.status(500);
    res.end("");
  });
});

//Student Settings
studentTabs.post("/settings",(req,res)=>{
  res.render("student/dashboard-tabs/settings");
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

//cors proxy for api fetch
studentTabs.post("/external/fetch",async(req,res)=>{
  fetch(req.body.url)
  .then(resp=>resp.json())
  .then(data=>{
    res.json({
      success:true,
      data
    });
  })
  .catch(error=>{
    console.log(error.message);
    resp.json({
      success:false,
      message:error.message
    });
  });
});

//recommendation layout
studentTabs.post("/recommendation",(req,res)=>{
  res.render("student/dashboard-tabs/recommendation");
});

//recommendation search
studentTabs.post("/recommendation/search",(req,res)=>{
  Promise.all([
    fetch(`${req.body.url}&location=india`),
    fetch(`${req.body.url}&location=usa`),
    fetch(`${req.body.url}&location=asia`)
  ])
  .then((resp)=>Promise.all(resp.map(re=>re.json())))
  .then(([d1,d2,d3])=>{
    var data=[...d1,...d2,...d3];
    parsed=[];
    data.forEach(job=>{
      var p=purifyDescription(stripHTML(job.description).result);
      parsed=[...parsed,...p];
    })
    return notInEnglishWords(mostRepeated(parsed)).splice(0,100);
  }).then(data=>{
    res.json({
      success:true,
      data
    });
  })
  .catch(error=>{
    console.log(error.message);
    res.json({
      success:false,
      message:error.message
    });
  });
});

//placement prediction
studentTabs.post("/prediction",async(req,res)=>{
  const NeuralNetwork=require("../neural_network/trained-model.js");
  const user=await new User(req);
  await user.initialize().then(async data=>{
    var userData=await user.getUserData(data.user);
    var input=[
      userData.result.data.admission.engineering,//engineering
      userData.result.data.education.sslc.mark/100,//sslc
      userData.result.data.education.plustwo.mark/100//plustwo
    ];
    //Atleast one course will be there
    var ug=0,pg=0;// ug uses cgpa and pg is binary status of yes or no
    userData.result.data.education.course.forEach(course=>{
      console.log(course.type,course.cgpa);
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
    console.log(input);

    // [0,0.823,0.784,0,1,0,1,1,0]


    var percent=NeuralNetwork(input);//predict
    var placement=percent<0.75?false:true;
    percent=parseInt(percent*10000)/100;
    // console.log(percent,placement);
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
