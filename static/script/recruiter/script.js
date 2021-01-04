const _=selector=>document.querySelector(selector);
const $=selector=>document.querySelectorAll(selector);
window.onload=(event)=>{
  //fake event
  selectThisOption({
    currentTarget:_(".nav-option")
    //selects only first element
  });
  Array.from($(".nav-option")).forEach(nav=>{
    nav.addEventListener("click",selectThisOption);
  });
};
function openTab(event)
{
  var target=event.currentTarget.getAttribute("data-target");
  if(target!=null)
  {
    _(`#${target}`).click();
  }
}
function selectThisOption(event)
{
  var a=event.currentTarget;
  var p=a.parentNode;
  var x=p.children;
  var n=x.length,i=0;
  var toURL=a.getAttribute("toURL");
  var userType=p.getAttribute("data-user");
  for(i=0;i<n;i++)
  {
    x[i].classList.remove("nav-option-active");
  }
  a.classList.add("nav-option-active");
  document.title=a.innerText;
  var c=_("#maincontainer");
  c.innerHTML="<div class='loader'></div>";
  if(toURL==null)
  {
    return;
  }
  fetch(`/${userType}/dashboard/${toURL}`,{
    method:"POST",
    cahce:"no-store"
  }).then(response=>{
    if(response.status===200)
    {
      response.text().then(data=>{
        c.innerHTML=data;
        Array.from($(".link")).forEach(link=>{
          link.addEventListener("click",openTab);
        });
      });
    }
    else
    {
      throw new Error(`Status Error : ${response.status}`);
    }
  }).catch(error=>{
    c.innerHTML="<div class='loadererror'></div>";
    console.warn(error.message);
  });
}
function createRecruiterAccount(event)
{
  event.preventDefault();
  var email=_("#email").value;
  var name=_("#name").value;
  var website=_("#website").value;
  var message=_("#create-account-message");
  if(email=="")
  {
    message.innerHTML="Enter E-Mail ID";
    return;
  }
  if(name=="")
  {
    message.innerHTML="Enter Company Name";
    return;
  }//website not mandatory
  event.currentTarget.classList.add("progress");
  message.innerHTML="";
  fetch("./dashboard/add-company-data",{
    method:"POST",
    cache:"no-store",
    headers:{
      'Content-Type':'application/json'
    },
    body:JSON.stringify({
      email,
      name,
      website
    })
  }).then(resp=>{
    if(resp.status===200)
    {
      return resp.json();
    }
    throw new Error("Status Error");
  }).then(data=>{
    if(data.message!=undefined)
    {
      message.innerHTML=data.message;
    }
    if(data.success)
    {
      showPopUp("success","Added Successfully");
    }
  }).catch(error=>{
    console.error(error.message);
    message.innerHTML="Unknown Error occured";
  }).finally(()=>{
    _("#create-recruiter-account-button").classList.remove("progress");
  });
}
function addSkill(event)
{
  const message=_("#post-job-message");
  const button=event.currentTarget;
  const textbox=button.previousElementSibling;
  var text=textbox.value.trim();
  var target=_(`#${button.getAttribute("data-target")}`);
  var main=_(`#${button.getAttribute("data-main")}`);
  var inp=_(`#${button.getAttribute("data-input")}`);
  if(text=="")
  {
    message.innerHTML="Enter keyword";
    textbox.focus();
    return;
  }
  else if(/[^a-zA-Z0-9\.\+\-, ]/.test(text))
  {
    message.innerHTML="Invalid Character Found";
    textbox.focus();
    return;
  }
  else
  {
    var c=0;
    text.split(",").map(skill=>skill.trim()).filter(skill=>skill!="").map(skill=>{return skill.replace(/[ ]+/g," ")}).forEach(ex=>{appendSkill(ex,target,main,inp);});
    textbox.value="";
  }
  recheckSkillValues(inp,main);
}
function appendSkill(value,target,main,inp)
{
  if(!skillExists(value,main))
  {
    var container=main;
    var keyword=document.createElement("div");
    keyword.classList.add("keyword");
    var skill=document.createElement("div");
    skill.classList.add("skill");
    skill.innerHTML=value;
    keyword.appendChild(skill);
    var close=document.createElement("div");
    close.classList.add("close");
    close.innerHTML="&#10006;";
    close.addEventListener("click",closeSkill);
    keyword.appendChild(close);
    container.appendChild(keyword);
  }
  else
  {
    const message=_("#post-job-message");
    message.innerHTML=`${value} exists`;
  }
  recheckSkillValues(inp,main);
}
function closeSkill(event)
{
  var c=event.currentTarget.parentNode;
  var p=c.parentNode;
  p.removeChild(c);
  recheckSkillValues(_(`#${p.getAttribute("data-input")}`),_(`#${p.getAttribute("data-target")}`));
}
function recheckSkillValues(input,target)
{
  input.value=Array.from(target.children).map(skill=>skill.children[0].innerHTML).join(";");
}
function skillExists(value,target)
{
  return Array.from(target.children).some(shell=>shell.children[0].innerHTML==value);
}
function createJobPost(event)
{
  event.preventDefault();
  var message=_("#post-job-message");
  var m=_("#must-have-skill-text").value;
  var g=_("#good-to-have-skill-text").value;
  if(m!="" || g!="")
  {
    message.innerHTML="Click Add to add Skill";
    return false;
  }
  message.innerHTML="";
  var type=_("#job-type");
  _(".submit").classList.add("progress");
  fetch("./recruitments/add",{
    method:"POST",
    cache:"no-store",
    headers:{
      "Content-Type":"application/json",
    },
    body:JSON.stringify({
      title:_("#job-title").value,
      type:type.options[type.selectedIndex].value,
      date:(new Date(_("#job-closing-date").value)-0),
      salary:parseInt(_("#job-salary").value),
      mhskills:_("#must-have-skills").value.split(";"),
      ghskills:_("#good-to-have-skills").value.split(";"),
      description:_("#job-description").value,
      vacancy:parseInt(_("#job-vacancy").value),
      rounds:parseInt(_("#job-rounds").value),
      applied:[],
      selected:[],
      schedule:{
        recruiteraccepted:false,
        adminaccepted:false,
        date:""
      }
    })
  }).then(resp=>{
    if(resp.status==200)
    {
      return resp.json();
    }
    throw new Error("Status error");
  }).then(data=>{
    if(data.success)
    {
      showPopUp("success","Posted Job Successfully",()=>{
        _("#job").click();
      });
    }
  }).catch(err=>{
    console.log(err.message);
    message.innerHTML=err.message;
    showPopUp("error","Something went wrong");
  }).finally(()=>{
    _(".submit").classList.remove("progress");
  });
  return false;
}
function scheduleJobPost(event)
{
  event.preventDefault();
  var message=_("#schedule-message");
  var dc=_("#job-schedule-date");
  var date=dc.value;
  if(date=="")
  {
    message.innerHTML="Select Date";
    return;
  }
  if((new Date(date)-0)<(new Date(dc.min)-0))
  {
    message.innerHTML=`Select Date after ${new Date(dc.min).toString().split(" ").splice(1,3).join(" ")}`;
    return;
  }
  message.innerHTML="";
  _(".submit").classList.add("progress");
  fetch("./schedule/request",{
    method:"POST",
    cache:"no-store",
    headers:{
      "Content-Type":"application/json",
    },
    body:JSON.stringify({
      scheduleDate:date
    })
  }).then(resp=>{
    if(resp.status==200)
    {
      return resp.json();
    }
    throw new Error("Status error");
  }).then(data=>{
    if(data.success)
    {
      showPopUp("success","Requested Successfully",()=>{
        _("#schedule").click();
      });
    }
  }).catch(err=>{
    console.log(err.message);
    message.innerHTML=err.message
    showPopUp("error","Something went wrong");
  }).finally(()=>{
    _(".submit").classList.remove("progress");
  });
  return false;
}
function showStudentProfile(email)
{
  var iframe=_("#show-profile-frame");
  iframe.src=`/data/profile/${email}/view`;
}
function recruitStudent(event,email)
{
  var button=event.currentTarget;
  if(button.classList.contains("progress"))
  {
    return;
  }
  button.classList.add("progress");
  fetch(`./recruitments/${email}/recruit`)
  .then(resp=>{
    if(resp.status!==200)
    {
      throw new Error("Status Error");
    }
    else
    {
      return resp.json();
    }
  }).then(data=>{
    if(!data.success)
    {
      throw new Error("Unknown Error");
    }
    else
    {
      var info=document.createElement("div");
      info.classList.add("info-selected");
      info.innerHTML="Selected";
      button.replaceWith(info);
      var selectedStat=_("#total-stat-selected");
      var remainingStat=_("#total-stat-remaining");
      selectedStat.innerHTML=parseInt(selectedStat.innerHTML)+1;
      remainingStat.innerHTML=parseInt(remainingStat.innerHTML)-1;
      showPopUp("success","Recruited");
    }
  }).catch(err=>{
    console.log(err);
    button.classList.remove("progress");
    showPopUp("error","Something went wrong");
  });
}
function addDepartment(event)
{
  var department=_("#department").value;
  var button=event.currentTarget;
  var message=_("#add-department-message");
  var type=_("#department-type").selectedIndex;// just need type as index
  if(department=="")
  {
    message.innerHTML="Enter department name";
    return;
  }
  if(department.length<2)// eg: CS is valid but only has length 2, so minimum length is 2
  {
    message.innerHTML="Invalid department name";
    return;
  }
  if(/[^a-zA-Z ]/.test(department))
  {
    message.innerHTML="Invalid department name";
    return;
  }
  message.innerHTML="";
  button.classList.add("progress");
  fetch("./add-department/add",{
    method:"POST",
    cache:"no-store",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify({
      department,
      type
    })
  }).then(resp=>{
    if(resp.status===200)
    {
      return resp.json();
    }
    throw new Error(`Status Error ${resp.status}`);
  }).then(data=>{
    if(data.success)
    {
      showPopUp("success","Department added Successfully");
    }
    else
    {
      message.innerHTML=data.message;
    }
  }).catch(err=>{
    message.innerHTML="An error occured";
    console.log(err.message);
  }).finally(()=>{
    button.classList.remove("progress");
  });
}
function addCourse(event)
{
  var department=_("#department");
  var button=event.currentTarget;
  var message=_("#add-course-message");
  var course=_("#name").value;
  var num=_("#num").value;
  if(department.selectedIndex==0)
  {
    message.innerHTML="Select department";
    return;
  }
  if(course=="")
  {
    message.innerHTML="Enter course name";
    return;
  }
  if(course.length<2)
  {
    message.innerHTML="Invalid course name";
    return;
  }
  if(/[^a-zA-Z ]/.test(course))
  {
    message.innerHTML="Invalid course name";
    return;
  }
  num=parseInt(num);
  if(isNaN(num))
  {
    message.innerHTML="Invalid number of Semesters";
    return;
  }
  if(num<1 || num>15)
  {
    message.innerHTML="Semester should be between 1 and 15";
    return;
  }
  message.innerHTML="";
  button.classList.add("progress");
  fetch("./add-course/add",{
    method:"POST",
    cache:"no-store",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify({
      department:department.options[department.selectedIndex].value,
      course,
      num
    })
  }).then(resp=>{
    if(resp.status===200)
    {
      return resp.json();
    }
    throw new Error(`Status Error ${resp.status}`);
  }).then(data=>{
    if(data.success)
    {
      showPopUp("success","Course added successfully");
    }
    else
    {
      message.innerHTML=data.message;
    }
  }).catch(err=>{
    message.innerHTML="An error occured";
    console.log(err.message);
  }).finally(()=>{
    button.classList.remove("progress");
  });
}
function acceptSchedule(event)
{
  var button=event.currentTarget;
  var card=button.parentNode.parentNode;
  button.classList.add("progress");
  fetch(`./dashboard/schedule/${event.currentTarget.getAttribute("data-email")}/approve`,{
    method:"POST",
    cache:"no-store"
  }).then(resp=>{
    if(resp.status===200)
    {
      return resp.json();
    }
    else
    {
      throw new Error(`Status error ${resp.status}`);
    }
  }).then(data=>{
    if(data.success)
    {
      card.parentNode.removeChild(card);
      if(_(".schedule")==null)
      {
        _(".scheduler").innerHTML=`<div class="schedule">Nothing pending</div>`;
      }
      showPopUp("success","Approved successfully");
    }
    else
    {
      throw new Error(`An error occured`);
    }
  }).catch(err=>{
    console.log(err.message);
    showPopUp("error","Something went wrong");
  }).finally(()=>{
    button.classList.remove("progress");
  });
}
function selectCoordinator(event)
{
  var email=_("#email").value;
  var message=_("#select-coordinator-message");
  var button=event.currentTarget;
  if(email=="")
  {
    message.innerHTML="Enter E-Mail id";
    return;
  }
  if(!/^\S+@\S+\.\S+$/.test(email))
  {
    message.innerHTML="Invalid E-Mail id";
    return;
  }
  message.innerHTML="";
  button.classList.add("progress");
  fetch(`./student/add/${email}/coordinator`,{
    method:"POST",
    cache:"no-store"
  }).then(resp=>{
    if(resp.status===200)
    {
      return resp.json();
    }
    else
    {
      throw new Error(`Status error ${resp.status}`);
    }
  }).then(data=>{
    if(data.success)
    {
      showPopUp("success","Selected successfully");
    }
    else
    {
      showPopUp("error",data.message);
    }
  }).catch(err=>{
    console.log(err.message);
    showPopUp("error","An error occured");
  }).finally(()=>{
    button.classList.remove("progress");
  });
}
function dumpData(url,event,code=null)
{
  var button=event.currentTarget;
  var div=button.parentNode.parentNode;
  if(button.classList.contains("progress") || div.classList.contains("completed"))
  {
    return;
  }
  button.classList.add("progress");
  if(code==1)
  {
    showPopUp("warning","This is going to take a moment");
  }
  url=`dump-data/${url}`;
  fetch(url,{
    method:"POST",
    cache:"no-store"
  }).then(resp=>{
    if(resp.status===200)
    {
      return resp.json();
    }
    else
    {
      throw new Error(`Status Error ${resp.status}`);
    }
  }).then(data=>{
    if(data.success)
    {
      div.classList.add("completed");
    }
    else
    {
      throw new Error(data.message);
    }
  }).catch(err=>{
    console.log(err.message);
    showPopUp("error","Something went wrong");
  }).finally(()=>{
    button.classList.remove("progress");
  });
}
