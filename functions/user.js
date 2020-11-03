class User
{
  constructor()
  {
    this.isLoggedIn=false;//change
    //loggedin code
    this.type="guest";//change
    this.userDefaultCodes={
      "guest":0,
      "student":1,
      "coordinator":2,
      "recruiter":3,
      "admin":4
    };
    this.code=this.userDefaultCodes[this.type];
  }
  userCode(user="guest")
  {
    return this.userDefaultCodes[user];
  }
}
module.exports=User;
