const config=require("./config/config.json");
const express=require("express");
const session=require("express-session");
const fileUpload=require('express-fileupload');
const path=require("path");
const favicon=require("serve-favicon");
const route=require("./routes/main");
const chalk=require("chalk");

const PORT=config.SERVER.PORT;
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

app.use(favicon(path.join(__dirname,'static','images','favicon.ico')));

app.use("/static",express.static(path.join(__dirname,"static")));
app.use("/pictures",express.static(path.join(__dirname,"data/gallery")));

app.use("/",route);

app.listen(PORT,()=>{
  console.log(chalk.green.inverse(` Started server ${HOST} on port ${PORT} `));
});
