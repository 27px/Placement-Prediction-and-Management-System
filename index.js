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

app.use(favicon(path.join(__dirname,'static','images','favicon.ico')));

app.use("/static",express.static(path.join(__dirname,"static")));

app.use("/",route);

app.listen(PORT,()=>{
  console.log(`Started server ${HOST} on port : ${PORT}`);
});
