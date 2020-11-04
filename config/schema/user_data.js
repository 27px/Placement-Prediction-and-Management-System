const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const userDataSchema=new Schema({
  "type":String,
  "name":String,
  "email":String,
  "data":{

  },
  "pic_ext":String,
  "password":String,
  "messages":[{
    "type":String,
    "message":String,
    "from":Schema.Types.Objectid
  }]
});

module.exports=userDataSchema;
