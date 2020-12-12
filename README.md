# ⚠ ⚠ ⚠ In Development !!! ⚠ ⚠ ⚠

## 🏫 Campus Placement Prediction &amp; Management System 🏫
Predicts whether a Student gets Placed in Campus Placement using Python,

> Uses Node.js, MongoDB, Python

#### 📥 Installing App 📥

> One time installation

`npm run initialize`

Installs app (installs packages, creates data folders required)

> Create User Configuration file `user_config.json` file inside `user_config` folder.

```
{
  "OTP":{
    "TIMEOUT":10
  },
  "MAIL":{
    "SERVICE":"gmail",
    "MAIL":"examplemail@gmail.com",
    "PASSWORD":"examplepassword",
    "PORT":465,
    "SECURE":true
  },
  "NETIMAGES":{
    "OTP":"path/to/online/hosted/image/background-image",
    "RECRUITER":"path/to/online/hosted/image/welcome-image"
  }
}
```

#### 🏃 Starting 🏃

`npm run start`

#### 🚀 Running in developer mode 🚀

`npm run dev`

### LICENSE

Licensed under agpl-3.0
