const express=require("express");
const dumpData=express.Router();
const User=require("../functions/user.js");
const MongoClient=require("mongodb").MongoClient;
const DB_CONNECTION_URL=require("../config/db.js");
const config=require("../config/config.json");
const getResultFromCursor=require("../functions/getResultFromCursor.js");
const purifyDataSet=require("../functions/purifyDataSet.js");
const fs=require("fs").promises;
const path=require("path");
const brain=require('brain.js');

dumpData.post("/generate-dataset",async(req,res)=>{
  const user=await new User(req);
  await user.initialize().then(data=>{
    if(!(data.isLoggedIn && user.hasAccessOf("admin")))
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
  }).then(data_collection=>{
    return data_collection.aggregate([
      {
        "$match":{
          "$or":[
            {
              type:"student"
            },
            {
              type:"coordinator"
            }
          ],
          "data":{
            $exists:true
          },
          "otp":"verified"
        }
      },
      {
        "$project":{
          "_id":0,
          "data.admission.engineering":1,
          "data.admission.arrears":1,
          "data.admission.placed":1,
          "data.education.sslc.mark":1,
          "data.education.plustwo.mark":1,
          "data.education.course":1,
          "data.education.experience":1,
          "data.education.achievement":1
        }
      }
    ]);
  }).then(cursor=>{
    return Promise.all([
      getResultFromCursor(cursor),
      fs.readFile(path.join(__dirname,"..","neural_network","data.json"))
    ]);
  }).then(([result,oldDataSet])=>{
    oldDataSet=JSON.parse(oldDataSet.toString());
    oldDataSet=oldDataSet.concat(result.map(student=>{
      let std=purifyDataSet(student);
      return {
        "placed":(student.data.admission.placed?1:0),
        "engineering":std[0],
        "sslc":std[1],
        "plustwo":std[2],
        "ug":std[3],
        "pg":std[4],
        "project":std[5],
        "intern":std[6],
        "extras":std[7],
        "arrears":std[8]
      };
    }));
    return oldDataSet;
  }).then(students=>{
    return fs.writeFile(path.join(__dirname,"..","neural_network","data.json"),JSON.stringify(students,null,2));
  }).then(()=>{
    res.json({
      success:true
    });
  }).catch(error=>{
    console.log(error.message);
    res.json({
      success:false,
      message:error.message
    });
  });
});

dumpData.post("/train-model",(req,res)=>{
  var user=new User(req);
  return user.initialize().then(data=>{
    if(!(data.isLoggedIn && user.hasAccessOf("admin")))
    {
      throw new Error("Access Denied");
    }
    network=new brain.NeuralNetwork({
      hiddenLayers:[20]
    });
    return fs.readFile(path.join(__dirname,"..","neural_network","data.json"));
  }).then(raw_data=>{
    return JSON.parse(raw_data);
  }).then(data=>{
    return data.map(d=>{
      return {
        input:[d["engineering"],d["sslc"],d["plustwo"],d["ug"],d["pg"],d["project"],d["intern"],d["extras"],d["arrears"]],
        output:[d["placed"]]
      };
    });
  }).then(data=>{
    return network.train(data,{
      iterations:20000,
      errorThresh:0.00001,
      log:true,
      logPeriod:10
    });
  }).then(()=>{
    return fs.writeFile(path.join(__dirname,"..","neural_network","trained-model.js"),`module.exports=${network.toFunction().toString()};`);
  }).then(()=>{
    res.json({
      success:true
    });
  }).catch(err=>{
    console.log(err.message);
    res.json({
      success:false,
      message:err.message
    });
  });
});

dumpData.post("/move-data",(req,res)=>{
  var user=new User(req);
  return user.initialize().then(data=>{
    if(!(data.isLoggedIn && user.hasAccessOf("admin")))
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
  }).then(data_collection=>{
    return data_collection.aggregate([
      {
        "$match":{
          $or:[
            {
              type:"student"
            },
            {
              type:"coordinator"
            }
          ],
          "data":{
            $exists:true
          },
          "data.admission.placed":true
        }
      },
      {
        "$project":{
          "_id":0,
          "data.admission.course":1
        }
      }
    ]);
  }).then(cursor=>{
    return getResultFromCursor(cursor);
  }).then(data=>{
    return data.map(d=>d.data.admission.course);
  }).then(data=>{
    var r=[];
    data.forEach(d=>{
      r[d]=r[d]!=undefined?r[d]+1:1;
    });
    return r;
  }).then(data=>{
    MongoClient.connect(DB_CONNECTION_URL,{
      useUnifiedTopology:true
    }).then(mongo=>{
      return mongo.db(config.DB_SERVER.DB_DATABASE);
    }).then(db=>{
      return db.collection("statistical_data");
    }).then(data_collection=>{
      var r={};
      Object.keys(data).forEach(k=>{
        r[k]=data[k];
      });
      return data_collection.insertOne({
        "year":new Date().getFullYear(),
        "departments":r
      });
    }).then(r=>{
      if(r.insertedCount>0)
      {
        res.json({
          success:true
        });
      }
      else
      {
        throw new Error("Unknown Error");
      }
    });
  }).catch(err=>{
    console.log(err.message);
    res.json({
      success:false,
      message:err.message
    });
  });
});

dumpData.post("/dump-user/:user",async(req,res)=>{
  const user=await new User(req);
  await user.initialize().then(data=>{
    if(!(data.isLoggedIn && user.hasAccessOf("admin")))
    {
      throw new Error("Access Denied");
    }
    if(!(req.params.user=="student" || req.params.user=="recruiter" || req.params.user=="coordinator"))
    {
      throw new Error("Invalid User");
    }
    return MongoClient.connect(DB_CONNECTION_URL,{
      useUnifiedTopology:true
    });
  }).then(mongo=>{
    return mongo.db(config.DB_SERVER.DB_DATABASE);
  }).then(db=>{
    return db.collection("user_data");
  }).then(data_collection=>{
    let delOption;
    if(req.params.user=="recruiter")
    {
      delOption={
        type:"recruiter"
      }
    }
    else
    {
      delOption={
        $or:[
          {
            type:"student"
          },
          {
            type:"coordinator"
          }
        ]
      }
    }
    return data_collection.remove(delOption);
  }).then(result=>{
    if(result.result.ok==1)
    {
      res.json({
        success:true
      });
    }
    else
    {
      throw new Error("Unknown Error");
    }
  }).catch(error=>{
    console.log(error.message);
    res.json({
      success:false,
      message:error.message
    });
  });
});

dumpData.post("/delete/:folder",async(req,res)=>{
  const user=await new User(req);
  await user.initialize().then(data=>{
    if(!(data.isLoggedIn && user.hasAccessOf("admin")))
    {
      throw new Error("Access Denied");
    }
    if(!["certificate","gallery","idcard","profilepic","resource"].includes(req.params.folder))
    {
      throw new Error("Invalid Folder");
    }
    return fs.readdir(path.join(__dirname,"..","data",req.params.folder));
  }).then(dir=>{
    return Promise.all(dir.map(file=>fs.unlink(path.join(__dirname,"..","data",req.params.folder,file))));
  }).then(r=>{
    res.json({
      success:true
    });
  }).catch(error=>{
    console.log(error.message);
    res.json({
      success:false,
      message:error.message
    });
  });
});

module.exports=dumpData;
