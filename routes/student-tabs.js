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
const purifyDataSet=require("../functions/purifyDataSet.js");
const path=require("path");
const fs=require("fs");

//Main Home tab in Dashboard of Student
studentTabs.post("/main",async(req,res)=>{
  const user=await new User(req);
  await user.initialize().then(async(data)=>{
    if(data.isLoggedIn && user.hasAccessOf("student"))
    {
      var userData=await user.getUserData(data.user,{
        "_id":0,
        email:1,
        pic_ext:1,
        "data.name":1,
        "data.admission.course":1,
        "data.phone":1,
        about:1,
        messages:1
      });
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
          ]),
          db.collection("statistical_data").aggregate([
            {
              $sort:{
                year:1
              }
            }
          ])
        ]).then(([a,b,c,d])=>{
          return Promise.all([
            getResultFromCursor(a),
            getResultFromCursor(b),
            getResultFromCursor(c),
            getResultFromCursor(d)
          ]);
        }).then(([companies,coordinators,department,statistics])=>{
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
            department,
            statistics
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

//View all Drives
studentTabs.post("/drive",async(req,res)=>{
  const user=await new User(req);
  await user.initialize().then(async(data)=>{
    if(data.isLoggedIn && user.hasAccessOf("student"))
    {
      var userData=await user.getUserData(data.user,{
        "_id":0,
        "email":1,
        "data.education.skills":1
      });
      await MongoClient.connect(DB_CONNECTION_URL,{
        useUnifiedTopology:true
      }).then(async mongo=>{
        var db=await mongo.db(config.DB_SERVER.DB_DATABASE);
        return await db.collection("user_data")
        .aggregate([
          {
            $match:{
              type:"recruiter",
              "data.job":{
                $exists:true
              },
              "data.job.date":{
                $gt:(new Date()-0)
              }
            }
          },
          {
            $project:{
              "email":1,
              "data.name":1,
              "data.website":1,
              "data.job.salary":1,
              "data.job.vacancy":1,
              "data.job.title":1,
              "data.job.date":1,
              "data.job.mhskills":1,
              "data.job.ghskills":1,
              "data.job.vacancy":1,
              "data.job.rounds":1,
              "data.job.description":1,
              "data.job.type":1,
              "data.job.applied":1
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
              },
              applied:{
                $in:[userData.result.email,"$data.job.applied"]
              }
            }
          },
          {
            $sort:{
              applied:1,
              rank:-1,
              "data.job.salary":-1
            }
          }
        ]);
      }).then(async data=>{
        return await getResultFromCursor(data);
      }).then(jobs=>{
        // console.log(JSON.stringify(jobs,null,2));
        res.render("student/dashboard-tabs/view-drives",{
          jobs,
          skills:userData.result.data.education.skills
        });
      }).catch(err=>{
        console.log(err.message);
        res.render("student/dashboard-tabs/view-drives",{
          jobs:[],
          skills:[]
        });
      });
    }
  });
});

//Apply for Specific Drive
studentTabs.post("/drive/:drive/apply",async(req,res)=>{
  var drive=req.params.drive;
  const user=await new User(req);
  await user.initialize().then(async(data)=>{
    if(data.isLoggedIn && user.hasAccessOf("student"))
    {
      var userData=await user.getUserData(data.user,{
        "_id":0,
        "email":1,
        "data.name":1
      });
      await MongoClient.connect(DB_CONNECTION_URL,{
        useUnifiedTopology:true
      }).then(async mongo=>{
        var db=await mongo.db(config.DB_SERVER.DB_DATABASE);
        return await db.collection("user_data")
        .updateOne({
          "email":drive
        },{
          $push:{
            "data.job.applied":userData.result.email,
            "messages":{
              from:data.user,
              name:userData.result.data.name,
              message:`${userData.result.data.name} had applied for your Job Post`,
              type:"help",
              date:new Date()
            }
          }
        });
      }).then(r=>{
        if(r.result.n>0)
        {
          res.json({
            success:true
          });
        }
        else
        {
          res.json({
            success:false,
            message:"DB Error"
          });
        }
      }).catch(err=>{
        console.log(err.message);
        res.json({
          success:false,
          message:err.message
        });
      });
    }
  });
});

//participate in drive
// studentTabs.post("/drive/:drive/round/:round",(req,res)=>{
//   var drive=req.params.drive;
//   var round=req.params.round;
//   res.render("student/dashboard-tabs/participate-in-drive",{
//     drive,
//     round
//   });
// });

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

//recommendation layout
studentTabs.post("/training-resources",async(req,res)=>{
  const dir=path.join(__dirname,"../data/resource");//////
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
      res.render("student/dashboard-tabs/resources",{
        files,
        type
      });
    });
  });
});

//recommendation search
studentTabs.post("/recommendation/search",(req,res)=>{
  Promise.all([
    fetch(req.body.url),
    fetch(`${req.body.url}&location=india`),
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
    var userData=await user.getUserData(data.user,{
      "_id":0,
      "data.admission.engineering":1,
      "data.admission.arrears":1,
      "data.education.sslc.mark":1,
      "data.education.plustwo.mark":1,
      "data.education.course":1,
      "data.education.experience":1,
      "data.education.achievement":1
    });
    // var input=[
    //   userData.result.data.admission.engineering,//engineering
    //   userData.result.data.education.sslc.mark/100,//sslc
    //   userData.result.data.education.plustwo.mark/100//plustwo
    // ];
    // //Atleast one course will be there
    // var ug=0,pg=0;// ug uses cgpa and pg is binary status of yes or no
    // userData.result.data.education.course.forEach(course=>{
    //   // console.log(course.type,course.cgpa);
    //   if(course.type=="ug")
    //   {
    //     if(course.cgpa>ug)
    //     {
    //       ug=course.cgpa;
    //     }
    //   }
    //   else if(course.type=="pg")
    //   {
    //     pg=1;//not increment, just one
    //   }
    // });
    // ug/=10;//cgpa
    // input.push(ug);
    // input.push(pg);
    // var project=0,intern=0;
    // userData.result.data.education.experience.forEach(exp=>{
    //   if(exp.type=="project")
    //   {
    //     project++;
    //   }
    //   else // job or internship
    //   {
    //     intern++;
    //   }
    // });
    // project=Math.min(1,project/6); // range 0 to 1
    // intern=Math.min(1,intern); // one or zero
    // input.push(project);
    // input.push(intern);
    // var ach=Math.min(1,userData.result.data.education.achievement.length);
    // input.push(ach);//extras
    // var arrears=(Math.min(1,parseInt(userData.result.data.admission.arrears)/2)*100)/100;
    // input.push(arrears);

    var input=purifyDataSet(userData.result);
    var percent=NeuralNetwork(input);//predict
    var placement=percent<0.5?false:true;
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

//Coordinator Image Upload
studentTabs.post("/resource/upload",async(req,res)=>{
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
    if(isLoggedIn && type=="coordinator")
    {
      if(req.files!=undefined)
      {
        if(req.files.file!=undefined && req.body.title!="")
        {
          var fname=`${__dirname}/../data/resource/${req.files.file.name}`;
          await req.files.file.mv(fname).then(()=>{
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
          result.message="Files not Uploaded";
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

module.exports=studentTabs;
