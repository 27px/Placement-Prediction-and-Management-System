module.exports=function(student){
  var input=[
    student.data.admission.engineering,//engineering or not 0 or 1
    student.data.education.sslc.mark/100,//sslc mark from percent into range of 0 to 1
    student.data.education.plustwo.mark/100//plustwo mark from percent into range of 0 to 1
  ];
  //Atleast one course will be there
  var ug=0,pg=0;// ug uses cgpa and pg is binary status of yes or no
  student.data.education.course.forEach(course=>{
    if(course.type=="ug")
    {
      if(course.cgpa>ug)
      {
        ug=course.cgpa/10;//cgpa into range 0 to 1
      }
    }
    else if(course.type=="pg")
    {
      pg=1;//not increment, just one
    }
  });
  input.push(parseInt(ug*100)/100);
  input.push(pg);
  var project=0,intern=0;
  student.data.education.experience.forEach(exp=>{
    if(exp.type=="project")
    {
      project++;
    }
    else // job or internship
    {
      intern++;
    }
  });
  project=Math.min(1,project/6);
  project=parseInt(project*100)/100;
  input.push(project);//project range 0 to 1
  input.push(Math.min(1,intern));//intern one or zero
  input.push(Math.min(1,student.data.education.achievement.length));//extras 0 or 1
  input.push((Math.min(1,parseInt(student.data.admission.arrears)/2)*100)/100);//arrears 0 or 1
  return input;
}
