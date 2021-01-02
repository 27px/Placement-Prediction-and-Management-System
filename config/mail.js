const user_config=require("./user_config.json");
var mail_credentials={
  "service":user_config.MAIL.SERVICE,
  // "port":user_config.MAIL.PORT,
  // "secure":user_config.MAIL.SECURE,
  secure:false, // use SSL
  port:25, // smtp port
  "auth":{
    "user":user_config.MAIL.MAIL,
    "pass":user_config.MAIL.PASSWORD
  },
  tls:{
    rejectUnauthorized:false
  }
}
module.exports=mail_credentials;
