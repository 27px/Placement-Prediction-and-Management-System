class setUpStudentProfileData
{
  constructor(form,files)
  {
    let [department,course]=form.course.split(";");
    let courses=[];
    for(let i=1,coursedata={};form[`coursetype-${i}`]!==undefined;i++)
    {
      ["type","name","college","cgpa","passdate"].forEach(details=>{
        coursedata[details]=form[`course${details}-${i}`];
      });
      courses.push(coursedata);
      /////Also set Files
    }
    let experience=[];
    for(let i=1,experiencedata={};form[`experiencetype-${i}`]!==undefined;i++)
    {
      ["type","title","description","from","to"].forEach(details=>{
        experiencedata[details]=form[`experience${details}-${i}`];
      });
      experience.push(experiencedata);
      /////Also set Files
    }
    let achievements=[];
    for(let i=1,achievementdata={};form[`achievementtype-${i}`]!==undefined;i++)
    {
      ["type","title","description","from","to"].forEach(details=>{
        achievementdata[details]=form[`achievement${details}-${i}`];
      });
      achievements.push(achievementdata);
      /////Also set Files
    }
    let skills=form.skills.split(";");
    this.data={};
    this.data.name=form.name;
    this.data.about=form.about;
    this.data.phone=form.phone;
    this.data.gender=form.gender;
    this.data.dob=form.dob;
    this.data.admission={
      number:form.admnumber,
      type:form.admtype,
      year:form.admyear,
      department,
      course,
      semester:form.semester,
      arrears:form.arrears,
      passdate:form.passout
    };
    this.data.education={
      sslc:{
        board:form.sslcboard,
        school:form.sslcschool,
        mark:form.sslcpercent,
        passdate:form.sslcpassdate
      },
      plustwo:{
        board:form.plustwoboard,
        school:form.plustwoschool,
        mark:form.plustwopercent,
        passdate:form.plustwopassdate
      },
      courses,
      experience,
      achievements,
      skills
    };
  }
}

module.exports=setUpStudentProfileData;
