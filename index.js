const config=require("./config/config.json");
const express=require("express");
const session=require("express-session");
const fileUpload=require('express-fileupload');
const path=require("path");
const route=require("./routes/main");
const chalk=require("chalk");

const PORT=process.env.PORT || config.SERVER.PORT;
const HOST=config.SERVER.HOST;

var app=express();

app.set("views","./views");
app.set("view engine","ejs");

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(fileUpload());

app.use(session({
  secret:config.SESSION.SECRET,
  resave:false,
  saveUninitialized:false
}));

app.use("/static",express.static(path.join(__dirname,"static")));
app.use("/pictures",express.static(path.join(__dirname,"data","gallery")));
app.use("/data",express.static(path.join(__dirname,"data")));
app.use("/favicon.ico",express.static(path.join(__dirname,"static","images","favicon.ico")));

app.use("/",route);

app.listen(PORT,()=>{
  console.log(chalk.green.inverse(` Started server ${HOST} on port ${PORT} `));
});
