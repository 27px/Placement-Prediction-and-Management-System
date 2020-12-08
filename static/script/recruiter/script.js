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
  _(`#${target}`).click();
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
      window.location=data.redirect;
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
      window.location.reload();
    }
  }).catch(err=>{
    console.log(err.message);
    message.innerHTML=err.message
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
      window.location.reload();
    }
  }).catch(err=>{
    console.log(err.message);
    message.innerHTML=err.message
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
    }
  }).catch(err=>{
    console.log(err);
    button.classList.remove("progress");
  });
}
