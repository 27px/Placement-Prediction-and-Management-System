// Important (for Refference)
// Accessing User Class in Route

// route.get("/test",async(req,res)=>{
//
//   const user=await new User(req);
//   await user.initialize().then(data=>{
//     console.log("success");
//     console.log(data);
//   }).catch(error=>{
//     console.log("error");
//     console.log(error.message);
//   }).finally(()=>{
//     console.log("after");
//     res.end("OK");
//   });
//
// });

const MongoClient=require("mongodb").MongoClient;
const DB_CONNECTION_URL=require("../config/db.js");
const config=require("../config/config.json");
const getResultFromCursor=require("./getResultFromCursor.js");
const userDefaultCodes={
  "guest":0,
  "student":1,
  "coordinator":2,
  "recruiter":3,
  "admin":4
};
class User
{
  constructor(req)
  {
    this.session=req.session;
    this.cookies=req.cookies;
    this.isLoggedIn=false;//default
    this.type="guest";//default
    this.user="Guest";//default
  }
  async initialize()
  {
    if(this.session!==undefined && this.session.user!==undefined && this.session.type!==undefined)
    {
      this.isLoggedIn=true;
      this.type=this.session.type;
      this.user=this.session.user;
      delete this.session;//porperty of this object
      delete this.cookies;//porperty of this object
      return this;
    }
    else if(this.cookies[config.COOKIE.KEY]!==undefined)
    {
      var cookie=this.cookies[config.COOKIE.KEY];
      cookie=Buffer.from(cookie,"base64").toString("ascii");
      cookie=JSON.parse(cookie);
      var data={};
      return await this.checkCredentials(cookie.u,cookie.p).then(data=>{
        this.session.user=cookie.u;
        this.session.type=data.type;
        if(data.success===true)
        {
          this.isLoggedIn=true;
          this.type=data.type;
          this.user=cookie.u;
        }
        else
        {
          this.isLoggedIn=false;
          this.type="guest";
          this.user="guest";
        }
        delete this.session;//porperty of this object
        delete this.cookies;//porperty of this object
        return this;
      }).catch(err=>{
        //Unknown
        throw new Error("Some Other Error");
      });
    }
    else
    {
      this.isLoggedIn=false;
      this.type="guest";
      this.user="guest";
      delete this.session;//porperty of this object
      delete this.cookies;//porperty of this object
      return this;
    }
  }
  async checkCredentials(email,password)
  {
    var data={};
    await MongoClient.connect(DB_CONNECTION_URL,{
      useUnifiedTopology:true
    }).then(async mongo=>{
      const db=mongo.db(config.DB_SERVER.DB_DATABASE);
      await db.collection("user_data")
      .findOne({
        email,
        password
      })
      .then(result=>{
        if(result!==null)
        {
          data.success=true;
          data.type=result.type;
        }
        else
        {
          data.success=false;
          data.message="Invalid credentials";
        }
      }).catch(err=>{
        console.log(err.message);
        data.success=false;
        data.message="Loading Error";
        data.devlog=err.message;
      }).finally(()=>{
        mongo.close();
      });
    }).catch(error=>{
      console.log(error.message);
      data.success=false;
      data.message="Connection Error";
      data.devlog=error.message;
    });
    return data;
  }
  async getUserData(email,project=null)
  {
    var data={},query=[
      {
        "$match":{
          email
        }
      }
    ];
    if(project!==null && typeof(project)===typeof({}))
    {
      query.push({
        "$project":project
      });
    }
    await MongoClient.connect(DB_CONNECTION_URL,{
      useUnifiedTopology:true
    }).then(mongo=>{
      return mongo.db(config.DB_SERVER.DB_DATABASE);
    }).then(db=>{
      return db.collection("user_data");
    }).then(user_data_table=>{
      return user_data_table.aggregate(query);
    }).then(cursor=>{
      return getResultFromCursor(cursor);
    }).then(result=>{
      if(result!==null && result.length!==0)
      {
        data.success=true;
        data.result=result[0]===undefined?{}:result[0];//this function is intended to get data of one record(row) and should return first element
        delete data.result.password;
      }
      else
      {
        data.success=false;
        data.message="not Found";
      }
    }).catch(error=>{
      console.log(error.message);
      data.success=false;
      data.message=error.message;
    });
    return data;
  }
  userCode(code=this.type)
  {
    return userDefaultCodes[code];
  }
  hasAccessOf(access)//type other user types
  {
    if(access=="guest")//All users have access previlage of guest
    {
      return true;
    }
    else if(this.type=="student" && access=="student")
    {
      return true;
    }
    else if(this.type=="coordinator" && ["student","coordinator"].includes(access))//coordinator is also a student
    {
      return true;
    }
    else if(this.type=="recruiter" && access=="recruiter")//recruiter has no other previlages.
    {
      return true;
    }
    else if(this.type=="admin" && ["coordinator","admin"].includes(access))//Admin have coordinator access too
    {
      return true;
    }
    else
    {
      return false;
    }
  }
}
module.exports=User;
