const user_config=require("../data/config/user_config.json");
var mail_credentials={
  "service":user_config.MAIL.SERVICE,
  "auth":{
    "user":user_config.MAIL.MAIL,
    "pass":user_config.MAIL.PASSWORD
  }
}
module.exports=mail_credentials;
