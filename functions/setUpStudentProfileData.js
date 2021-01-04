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
      coursedata.cgpa=parseFloat(coursedata.cgpa);
      courses.push(coursedata);
    }
    // console.log(courses);
    let experience=[];
    for(let i=1;form[`experiencetype-${i}`]!=""&&form[`experiencetype-${i}`]!=undefined;i++)
    {
      var experiencedata={};
      ["type","title","description","from","to"].forEach(details=>{
        experiencedata[details]=form[`experience${details}-${i}`];
      });
      experience.push(experiencedata);
    }
    let achievements=[];
    for(let i=1;form[`achievementtype-${i}`]!=""&&form[`achievementtype-${i}`]!=undefined;i++)
    {
      var achievementdata={};
      ["type","title","description","from","to"].forEach(details=>{
        achievementdata[details]=form[`achievement${details}-${i}`];
      });
      achievements.push(achievementdata);
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
      arrears:parseInt(form.arrears),
      engineering,
      passdate:form.passout,
      placed:false
    };
    this.data.education={
      sslc:{
        board:form.sslcboard,
        school:form.sslcschool,
        mark:parseFloat(form.sslcpercent),
        passdate:form.sslcpassdate
      },
      plustwo:{
        board:form.plustwoboard,
        school:form.plustwoschool,
        mark:parseFloat(form.plustwopercent),
        passdate:form.plustwopassdate
      },
      course:courses,
      experience,
      achievement:achievements,
      skills
    };
  }
}

module.exports=setUpStudentProfileData;
