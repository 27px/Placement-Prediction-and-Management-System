const config=require("./config/config.json");
const express=require("express");
const path=require("path");
const favicon=require("serve-favicon");
const route=require("./routes/main");
const DB_CONNECTION_URL=require("./config/db.js");
const mongoose=require("mongoose");

const PORT=config.SERVER.PORT;
const HOST=config.SERVER.HOST;

var app=express();

app.set("views","./views");
app.set("view engine","ejs");

app.use(favicon(path.join(__dirname,'static','images','favicon.ico')));

app.use("/static",express.static(path.join(__dirname,"static")));

app.use("/",route);

app.listen(PORT,()=>{
  console.log(`Started server ${HOST} on port : ${PORT}`);
});
