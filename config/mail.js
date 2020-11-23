const user_config=require("../user_config/user_config.json");
var mail_credentials={
  "service":user_config.MAIL.SERVICE,
  port:25, // smtp port
  secure:false, // use SSL
  "auth":{
    "user":user_config.MAIL.MAIL,
    "pass":user_config.MAIL.PASSWORD
  },
  tls:{
    rejectUnauthorized:false
  }
}
module.exports=mail_credentials;
