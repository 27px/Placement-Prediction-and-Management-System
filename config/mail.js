const user_config=require("../user_config/user_config.json");
var mail_credentials={
  "service":user_config.MAIL.SERVICE,
  // "port":user_config.MAIL.PORT,
  // "secure":user_config.MAIL.SECURE,
  "auth":{
    "user":user_config.MAIL.MAIL,
    "pass":user_config.MAIL.PASSWORD
  }
}
module.exports=mail_credentials;
