require("dotenv").config();
const express=require("express");
const path=require("path");
const favicon=require("serve-favicon");
const route=require("./routes/main");

const PORT=process.env.PORT;
const HOST=process.env.HOST;

var app=express();

app.set("views","./views");
app.set("view engine","ejs");

app.use("*/images",express.static(path.join(__dirname,"static","images")));
app.use("*/style",express.static(path.join(__dirname,"static","style")));
app.use("*/script",express.static(path.join(__dirname,"static","script")));

app.use(favicon(path.join(__dirname,'static','images','favicon.ico')));

app.use("/",route);

app.listen(PORT,HOST,()=>{
  console.log(`Started server ${HOST} on port : ${PORT}`);
});
