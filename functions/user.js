const userDefaultCodes={
  "guest":0,
  "student":1,
  "coordinator":2,
  "recruiter":3,
  "admin":4
};
class User
{
  constructor(session)
  {
    this.isLoggedIn=false;//default
    this.type="guest";//default
    if(session.user!==undefined && session.type!==undefined)
    {
      this.isLoggedIn=true;
      this.type=session.type;
      this.user=session.user;
    }
    this.code=userDefaultCodes[this.type];
  }
  userCode()
  {
    return userDefaultCodes[this.type];
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
    else if(this.type=="admin" && access=="admin")//Admin have coordinator access too
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
