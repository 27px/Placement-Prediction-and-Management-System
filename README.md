# 🏫 Campus Placement Prediction &amp; Management System
Predicts whether a Student gets Placed in Campus Placement using Brain.JS,

> Uses Node.JS and MongoDB

<img align="left" src="https://img.shields.io/badge/Node.JS-12.16.3-brightgreen"> <img align="left" src="https://img.shields.io/badge/MongoDB-4.4.1-brightgreen">
<br>

#### 📥 Installing Web App 📥

> One time installation

`npm run initialize`

Installs app (installs packages, creates data folders required)

> Create User Configuration file `user_config.json` file inside `config` folder. An example file is given in the folder `config` named `user_config.example.json`. Note that you have to set your email id and password in the `user_config.json` to send emails. Keep the file secure, make sure to add in `.gitignore`. NETIMAGES are images from the internet (direct link), to show in mail. If you have a hosted server, you can use it. (Note: `localhost` won't work)

```json
// config/user_config.json

{
  "OTP":{
    "TIMEOUT":10
  },
  "MAIL":{
    "SERVICE":"gmail",
    "MAIL":"your_email_id_here",
    "PASSWORD":"your_password_here",
    "PORT":465,
    "SECURE":true
  },
  "NETIMAGES":{
    "OTP":"path/to/online/hosted/image/background-image",
    "RECRUITER":"path/to/online/hosted/image/welcome-image"
  }
}
```

> Databases

`department` ,  `statistical_data` &amp; `user_data`


> Example admin user (add manually in database)

```json
{
  "email": "email_id",
  "password": "base64_encoded_password",
  "type": "admin",
  "messages": []
}
```

#### 🏃 Starting 🏃

`npm run start`

#### 🚀 Running in developer mode 🚀

`npm run dev`

### LICENSE

Licensed under `agpl-3.0`
