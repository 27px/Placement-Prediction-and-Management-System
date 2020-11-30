class setUpStudentProfileData
{
  constructor(form,files)
  {
    let [department,course,engineering]=form.course.split(";");
    engineering=parseInt(engineering);
    let courses=[];
    for(let i=1;form[`coursetype-${i}`]!="" && form[`coursetype-${i}`]!=undefined;i++)
    {
      var coursedata={};
      ["type","name","college","cgpa","passdate"].forEach(details=>{
        coursedata[details]=form[`course${details}-${i}`];
      });
      courses.push(coursedata);
      /////Also set Files
    }
    console.log(courses);
    let experience=[];
    for(let i=1;form[`experiencetype-${i}`]!=""&&form[`experiencetype-${i}`]!=undefined;i++)
    {
      var experiencedata={};
      ["type","title","description","from","to"].forEach(details=>{
        experiencedata[details]=form[`experience${details}-${i}`];
      });
      experience.push(experiencedata);
      /////Also set Files
    }
    let achievements=[];
    for(let i=1;form[`achievementtype-${i}`]!=""&&form[`achievementtype-${i}`]!=undefined;i++)
    {
      var achievementdata={};
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
      engineering,
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
      course:courses,
      experience,
      achievement:achievements,
      skills,
      applied_jobs:[],
      skill_recommendation:[],
      placement_prediction:{},
      custom_resume:{}
    };
  }
}

module.exports=setUpStudentProfileData;
