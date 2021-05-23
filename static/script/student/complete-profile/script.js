const scrollDelay=1000;//important don't change // waits for next page to scroll into view to show next inline navigation
var scrollnumber=3,tabs=12;
max_file_upload_size=3;// In MB
const _=s=>document.querySelector(s);
const $=s=>document.querySelectorAll(s);
const pi=s=>parseInt(s);
var minute,second;
var exactScroll=false;
function scrollToNav(n)
{
  var offset=!exactScroll?scrollnumber:-1;
  n=Math.min(n+offset,tabs);
  //this delay is required and must not be removed
  setTimeout(function(){
    _(".pro").children[n].scrollIntoView();
  },scrollDelay);
}
function closeMultipleForm(x,type,msg,optional)
{
  var t=_(`#${type}-adder`),p=x.parentNode;
  if($(`.multiple-${type}`).length<2)
  {
    if(optional)
    {
      p.innerHTML+=" ";
      t.setAttribute("data-multiple",$(`.multiple-${type}`).length);
      return;
    }
    t.setAttribute("data-multiple",$(`.multiple-${type}`).length);
    setMessage(`#message-box-${msg}`,`Atleast one ${type} required`,"warning");
    recheckFormMove(type);
    return;
  }
  var n=pi(p.getAttribute("data-multiple"));
  if(_(`#multiple-${type}-${n+1}`))
  {
    var x=[],c=0;
    while(_(`#multiple-${type}-${n+(++c)}`)!==null)
    {
      x.push(_(`#multiple-${type}-${n+c}`));
    }
    var temp=pi(x.pop().getAttribute("data-multiple"));
    replaceIdName(temp,n,msg,type);
    t.setAttribute("data-multiple",$(`.multiple-${type}`).length);
  }
  p.parentNode.removeChild(p);
  _(`.multiple-${type}`).classList.add("multiple-active");
  t.setAttribute("data-multiple",$(`.multiple-${type}`).length);
  recheckFormMove(type);
}
function addSkill()
{
  const textbox=_("#skill-text");
  var text=textbox.value.trim();
  if(text=="")
  {
    setMessage("#message-box-11","Type keywords to add","warning");
    return;
  }
  else if(/[^a-zA-Z0-9\.\+\-, ]/.test(text))
  {
    setMessage("#message-box-11","Invalid Character found","warning");
    return;
  }
  else
  {
    resetMessage("#message-box-11");
    var c=0;
    text.split(",").map(skill=>skill.trim()).filter(skill=>skill!="").map(skill=>{return skill.replace(/[ ]+/g," ")}).forEach(appendSkill);
    textbox.value="";
  }
  recheckSkillValues();
}
function skillExists(value)
{
  return Array.from(_("#skill-view").children).some(shell=>shell.children[0].innerHTML==value);
}
function appendSkill(value)
{
  if(!skillExists(value))
  {
    var container=_("#skill-view");
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
    setMessage("#message-box-11",`${value} exists`,"warning");
  }
  recheckSkillValues();
}
function closeSkill(event)
{
  var c=event.currentTarget.parentNode;
  c.parentNode.removeChild(c);
  recheckSkillValues();
}
function recheckSkillValues()
{
  _("#skills").value=Array.from(_("#skill-view").children).map(skill=>skill.children[0].innerHTML).join(";");
}
function recheckFormMove(type)
{
  var lf=_(`#mf-arrow-left-${type}`);
  var rf=_(`#mf-arrow-right-${type}`);
  Array.from($(`.multiple-${type}`)).forEach(mf=>{
    if(mf.classList.contains(`multiple-active`))
    {
      var mfp=mf.previousElementSibling;
      var mfn=mf.nextElementSibling;
      if(mfp!=null && mfp.classList.contains("multiple"))
      {
        lf.classList.remove("mf-move-disabled");
      }
      else
      {
        lf.classList.add("mf-move-disabled");
      }
      if(mfn!=null && mfn.classList.contains("multiple"))
      {
        rf.classList.remove("mf-move-disabled");
      }
      else
      {
        rf.classList.add("mf-move-disabled");
      }
    }
  });
}
function replaceIdName(t,n,msg,type)
{
  var a=_(`#multiple-${type}-${t}`);
  a.setAttribute("data-multiple",n);
  a.id=`multiple-${type}-${n}`;
  if(type=="course")
  {
    var elements=["type","name","college","cgpa","passdate"];
  }
  else if(type=="experience" || type=="achievement")
  {
    var elements=["type","title","description","from","to"];
    ["from","to"].forEach(date=>{
      var e=_(`#${type}-${date}-label-${t}`);
      e.setAttribute("for",`${type}${date}-${n}`);
      e.id=`${type}-${date}-label-${n}`;
    });
  }
  elements.forEach(elm=>{
    var b=_(`#${type}${elm}-${t}`);
    b.name=`${type}${elm}-${n}`;
    b.id=`${type}${elm}-${n}`;
  });
  var c=_(`#${type}certificate-${t}`);
  c.name=`${type}certificate-${n}`;
  c.setAttribute("onchange",`selectedImageOrPdf(this,'view-${type}certificate-${n}',${msg});`);
  c.id=`${type}certificate-${n}`;
  var d=_(`#view-${type}certificate-${t}`);
  d.id=`view-${type}certificate-${n}`;
  d.children[1].setAttribute("onclick",`selectFile('${type}certificate-${n}');`);
}
function multiFormMove(type,direction)
{
  var x=Array.from($(`.multiple-${type}`));
  for(let i=0,n=x.length;i<n;i++)
  {
    var mf=x[i];
    if(mf.classList.contains("multiple-active"))
    {
      var ret;
      if(type=="course")
      {
        ret=isMultiFormCourseValid(pi(mf.getAttribute("data-multiple")));
        if(ret.success!=true)
        {
          setMessage("#message-box-8",ret.message,ret.type);
          return false;
        }
      }
      else if(type=="experience")
      {
        ret=isMultiFormExpAchValid(pi(mf.getAttribute("data-multiple")),"experience");
        if(ret.success!=true || ret.type=="warning" || ret.type=="error")
        {
          setMessage("#message-box-9",ret.message,ret.type);
          return false;
        }
      }
      else if(type=="achievement")
      {
        ret=isMultiFormExpAchValid(pi(mf.getAttribute("data-multiple")),"achievement");
        if(ret.success!=true || ret.type=="warning" || ret.type=="error")
        {
          setMessage("#message-box-10",ret.message,ret.type);
          return false;
        }
      }
      if(direction=="left")
      {
        var mfp=mf.previousElementSibling;
        if(mfp!=null && mfp.classList.contains("multiple"))
        {
          mf.classList.remove("multiple-active");
          mfp.classList.add("multiple-active");
          recheckFormMove(type);
          return;
        }
      }
      else if(direction=="right")
      {
        var mfn=mf.nextElementSibling;
        if(mfn!=null && mfn.classList.contains("multiple"))
        {
          mf.classList.remove("multiple-active");
          mfn.classList.add("multiple-active");
          recheckFormMove(type);
          return;
        }
      }
    }
  }
  recheckFormMove(type);
}
function setProgress(clock,progress,total,unit)
{
  var dash=220;//SVG dash array
  progress=(progress>total)?total:progress;
  var cur=(progress*dash)/total;
  _('#svg_'+clock+'_path').setAttribute("stroke-dasharray",cur+","+(dash-cur));
  _('#svg_'+clock+'_text').innerHTML=progress+unit;
}
function addAnotherForm(x,type)
{
  var n=pi(x.getAttribute("data-multiple"));
  if(n>0)
  {
    var mxf=Array.from($(`.multiple-${type}`));
    for(let i=0,n=mxf.length;i<n;i++)
    {
      var mf=mxf[i];
      if(mf.classList.contains(`multiple-active`))
      {
        if(type=="course")
        {
          var ret=isMultiFormCourseValid(pi(mf.getAttribute("data-multiple")));
          if(ret.success!=true)
          {
            setMessage("#message-box-8",ret.message,ret.type);
            _(window.location.hash).scrollIntoView();
            return false;
          }
        }
        else if(type=="experience")
        {
          var ret=isMultiFormExpAchValid(pi(mf.getAttribute("data-multiple")),"experience");
          if(ret.success!=true || ret.type=="warning" || ret.type=="error")
          {
            setMessage("#message-box-9",ret.message,ret.type);
            _(window.location.hash).scrollIntoView();
            return false;
          }
        }
        else if(type=="achievement")
        {
          var ret=isMultiFormExpAchValid(pi(mf.getAttribute("data-multiple")),"achievement");
          if(ret.success!=true || ret.type=="warning" || ret.type=="error")
          {
            setMessage("#message-box-10",ret.message,ret.type);
            _(window.location.hash).scrollIntoView();
            return false;
          }
        }
      }
    }
  }
  n++;
  x.setAttribute("data-multiple",n);
  Array.from($(`.multiple-${type}`)).forEach(t=>{
    t.classList.remove("multiple-active");
  });
  var bd;
  if(type=="course")
  {
    bd=getMultipleCourseForm(n);
  }
  else if(type=="experience")
  {
    bd=getMultipleExperienceForm(n);
  }
  else if(type=="achievement")
  {
    bd=getMultipleAchievementForm(n);
  }
  _(`#multiple-${type}-wrapper`).appendChild(bd);
  recheckFormMove(type);
  _(window.location.hash).scrollIntoView();
}
function setScrollNumber()
{
  if(document.body.clientWidth<500)
  {
    scrollnumber=0;
  }
  else if(document.body.clientWidth<800)
  {
    scrollnumber=2;
  }
  else if(document.body.clientWidth<800)
  {
    scrollnumber=3;
  }
}
function nextPage(event)
{
  const hash=window.location.hash;
  var from=pi(hash.split("-")[1]);
  var to=pi(event.currentTarget.href.split("#")[1].split("-")[1]);
  if(from==1 && !_(".pro").children[0].classList.contains("active-box"))
  {
    setMessage("#message-box-1","Verify OTP before moving to next","warning");
    event.preventDefault();
    return;
  }
  if(_(".pro").children[to-1].classList.contains("no-visit"))
  {
    event.preventDefault();
    return;
  }
  window.location.hash=`box-${to}`;
}
function verifyOTP()
{
  var otp="";
  Array.from(_(".otp-container").children).forEach(input=>{
    otp+=input.value;
  });
  if(isNaN(pi(otp)))
  {
    setMessage("#message-box-1","Invalid OTP","error");
    return;
  }
  if(otp.length<6)
  {
    setMessage("#message-box-1","Invalid OTP","error");
    return;
  }
  else
  {
    setMessage("#message-box-1","Loading . . .","info");
  }
  fetch("./new/verify-otp",{
    method:"POST",
    cache:"no-store",
    headers:{
      'Content-Type':"application/json"
    },
    body:JSON.stringify({otp})
  })
  .then(result=>result.json())
  .then(data=>{
    if(!data.success)
    {
      setMessage("#message-box-1",data.message,"error");
      if(data.devlog!=undefined)
      {
        console.error(data.devlog);
      }
    }
    else
    {
      setMessage("#message-box-1",data.message,"success");
      clearOtpText();
      _(".pro").children[0].classList.add("active-box");
      _(".pro").children[0].classList.add("no-visit");//only for otp
      window.location.hash="#box-2";
    }
  })
  .catch(err=>{
    console.error(err.message);
    setMessage("#message-box-1","Unknown error","error");
  });
}
function setUpCourseForm(data)
{
  var course=_("#course");
  data.forEach(value=>{
    var group=document.createElement("optgroup");
    group.label=value.name;
    value.courses.forEach(c=>{
      var option=document.createElement("option");
      option.value=`${value._id};${c.name};${value.engineering}`;
      option.innerHTML=c.name;
      option.setAttribute("data-max-sem",c.num_of_sem);
      group.appendChild(option);
    });
    course.appendChild(group);
  });
}
function setUpSemester()
{
  var course=_("#course");
  var semester=_("#semester");
  semester.innerHTML="<option disabled selected value> -- Current Semester -- </option>";
  var option=course.selectedIndex<0?"":course.options[course.selectedIndex];
  for(let i=0,n=pi(option.getAttribute("data-max-sem"));i<n;i++)
  {
    var o=document.createElement("option");
    o.innerHTML=`Semester ${i+1}`;
    o.value=i+1;
    semester.appendChild(o);
  }
}
window.onload=()=>{
  setScrollNumber();
  setCurrentInlineNavActive();
  var __dashboard=_("#nav-dashboard");
  if(__dashboard!=null)
  {
    __dashboard.addEventListener("click",function(){
      event.preventDefault();
      return false;
    });
  }
  var __nav_profile=_("#nav-profile");
  if(__nav_profile!=null)
  {
    __nav_profile.addEventListener("click",function(){
      event.preventDefault();
      return false;
    });
  }
  // var created=pi(_(".timers").getAttribute("data-start"));
  fetch("/data/course/name",{
    method:"GET",
    cache:"no-store"
  }).then(response=>response.json())
  .then(data=>{
    setUpCourseForm(data);
  })
  .catch(error=>{
    console.log(error.message);
  });
  document.body.addEventListener("keydown",event=>{
    if(event.keyCode===9)
    {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  });
  //global variables
  minute=_("#svg_minute_text");
  second=_("#svg_second_text");
  //set initial timer position
  setProgress("second",pi(second.innerHTML),60," s");
  setProgress("minute",pi(minute.innerHTML),60," m");
  //start timer
  startChanges();
  //disable inactive anchors
  Array.from(_(".pro").children).forEach(anchor=>{
    anchor.addEventListener("click",nextPage);
  });
  _(".resend").addEventListener("click",function(){
    window.location.hash="";
    window.location.reload();
  });
  Array.from(_(".otp-container").children).forEach(text=>{
    [
      "input",
      "keydown",
      "keyup",
      "mousedown",
      "mouseup",
      "select",
      "contextmenu",
      "drop",
      "focus"
    ].forEach(event=>{
      text.addEventListener(event,acceptNumberOnly);
    });
  });
  _("#verify-otp").addEventListener("click",verifyOTP);
  _("#otp-1").focus();
  //add course form
  ["course","experience","achievement"].forEach(type=>{
    addAnotherForm(_(`#${type}-adder`),type);
  });
};
window.onresize=()=>{
  setScrollNumber()
};
window.onhashchange=()=>{
  setCurrentInlineNavActive();
};
function setCurrentInlineNavActive()
{
  var current=pi(window.location.hash.split("-")[1]);
  var anchors=_(".pro").children;
  Array.from(anchors).forEach(anchor=>{
    anchor.classList.remove("current-box");
  });
  anchors[current-1].classList.add("current-box");
  scrollToNav(current);
}
function acceptNumberOnly(event)
{
  if(!/[0-9]/.test(this.value))
  {
    this.value="";
  }
  else
  {
    var next=_(`#otp-${pi(this.id.replace("otp-",""))+1}`);
    if(next!=null)
    {
      next.focus();
    }
    else
    {
      _("#verify-otp").focus();
    }
  }
}
function startChanges()
{
  var t=setInterval(function(){
    var timer={
      minute:pi(minute.innerHTML),
      second:pi(second.innerHTML)
    };
    //Second
    var s=timer.second;
    if(s>0)
    {
      setProgress("second",s-1,60," s");
    }
    else
    {
      setProgress("second",59,60," s");
      //Minute
      var m=timer.minute;
      if(m>0)
      {
        setProgress("minute",m-1,60," m");
      }
      else
      {
        // when timer hits zero
        setProgress("minute",0,60," m");
        setProgress("second",0,60," s");
        clearInterval(t);
        _("#first-tab").innerHTML=`
        <div class="row">
          <div class="title">OTP Expired</div>
        </div>
        <div class="row">
          <div class="message" id="message-box-1"></div>
        </div>
        <div class="row">
          <button type="button" class="b-blue" onclick="window.location.hash="";window.location.reload();">Resend</button>
        </div>
        `;
      }
      //Minute
    }
    //Second
  },1000);//1000 milliseconds
}
function clearOtpText()
{
  Array.from(_(".otp-container").children).forEach(text=>{
    text.value="";
  })
  _("#otp-1").focus();
}
function setMessage(selector,message,type)
{
  var m=_(selector);
  resetMessage(selector);
  //tnis delay is necessary
  setTimeout(function(){
    m.innerHTML=message;
    m.classList.add("m-"+type);
  },0);
}
function resetMessage(selector)
{
  var m=_(selector);
  m.innerHTML="";
  m.classList.remove("m-success");
  m.classList.remove("m-info");
  m.classList.remove("m-warning");
  m.classList.remove("m-error");
}
function alreadyVerified()
{
  setProgress("minute",0,60," m");
  setProgress("second",0,60," s");
  clearInterval(1);
  _("#first-tab").innerHTML=`
  <div class="row">
    <div class="title">OTP Verified</div>
  </div>
  `;
}
function selectFile(id)
{
  _(`#${id}`).click();
}
function selectedProfilePic(element)
{
  var file=element.files[0];
  var preview=_(".real-preview");
  var alt=_("#alt-profile-pic");
  var profilepic=_("#view-profilepic");
  if(file!=undefined)
  {
    if(file.type.split("/")[0]!="image")
    {
      preview.src="";
      alt.classList.remove("hidden");
      setMessage("#message-box-2","Invalid Image","error");
      profilepic.classList.remove("file-selected");
      profilepic.classList.add("file-select-error");
      return;
    }
    else if((file.size/(1024*1024))>max_file_upload_size)
    {
      preview.src="";
      alt.classList.remove("hidden");
      setMessage("#message-box-2",`Add File size < ${max_file_upload_size} MB`,"error");
      profilepic.classList.remove("file-selected");
      profilepic.classList.add("file-select-error");
      return;
    }
    resetMessage("#message-box-2");
    try
    {
      var reader=new FileReader();
      reader.readAsDataURL(file);
      reader.onload=()=>{
        preview.src=reader.result;
        alt.classList.add("hidden");
        profilepic.classList.remove("file-select-error");
        profilepic.classList.add("file-selected");
      };
      reader.onerror=()=>{
        throw reader.error;
      };
    }
    catch(error){
      console.warn(error);
      preview.src="";
      alt.classList.remove("hidden");
      setMessage("#message-box-2","No preview Available","warning");
      profilepic.classList.remove("file-selected");
      profilepic.classList.add("file-select-error");
    }
  }
  else
  {
    preview.src="";
    alt.classList.remove("hidden");
    profilepic.classList.remove("file-selected");
    profilepic.classList.add("file-select-error");
  }
}
function selectedImageOrPdf(element,id,m)
{
  //currentyly not accepting Image type even the name says so
  var file=element.files[0];
  var x=_(`#${id}`);
  if(file!=undefined)
  {
    // if(!(file.type.split("/")[0]=="image" || file.type=="application/pdf"))
    if(file.type!="application/pdf")
    {
      setMessage(`#message-box-${m}`,"Select PDF","error");
      x.classList.remove("file-selected");
      x.classList.add("file-select-error");
      _(window.location.hash).scrollIntoView();
      return false;
    }
    else if((file.size/(1024*1024))>max_file_upload_size)
    {
      setMessage(`#message-box-${m}`,`Add File size < ${max_file_upload_size} MB`,"error");
      x.classList.remove("file-selected");
      x.classList.add("file-select-error");
      _(window.location.hash).scrollIntoView();
      return false;
    }
    else
    {
      x.classList.remove("file-select-error");
      x.classList.add("file-selected");
      _(window.location.hash).scrollIntoView();
      return true;
    }
  }
  else
  {
    x.classList.remove("file-selected");
    x.classList.add("file-select-error");
    _(window.location.hash).scrollIntoView();
    return false;
  }
  _(window.location.hash).scrollIntoView();
  return false;
}
function isXthPageValid(num=1)
{
  var result=false;
  if(num==1)//OTP
  {
    if(!_(".pro").children[0].classList.contains("active-box"))
    {
      result=false;
    }
    result=true;
  }
  else if(num==2)
  {
    result=isSecondPageValid();
  }
  else if(num==3)
  {
    result=isThirdPageValid();
  }
  else if(num==4)
  {
    result=isFourthPageValid();
  }
  else if(num==5)
  {
    result=isFifthPageValid();
  }
  else if(num==6)
  {
    result=isSixthPageValid();
  }
  else if(num==7)
  {
    result=isSeventhPageValid();
  }
  else if(num==8)
  {
    result=isEighthPageValid();
  }
  else if(num==9)
  {
    result=isNinethPageValid();
  }
  else if(num==10)
  {
    result=isTenthPageValid();
  }
  else if(num==11)
  {
    result=isEleventhPageValid();
  }
  else if(num==12)
  {
    result=true;
  }
  if(result)
  {
    _(`.pro`).children[num-1].classList.add("active-box");
  }
  else
  {
    _(`.pro`).children[num-1].classList.remove("active-box");
  }
  return result;
}
function isSecondPageValid()
{
  var msg="#message-box-2",name=_("#name").value,about=_("#about").value,pic=_("#profilepic").files[0];
  if(name=="")
  {
    setMessage(msg,"Enter your Name","error");
    return false;
  }
  else if(name.length<3)
  {
    setMessage(msg,"Name too short","error");
    return false;
  }
  else if(!/^[a-zA-Z ]*$/.test(name))
  {
    setMessage(msg,"Symbols and numbers not allowed in name","error");
    return false;
  }
  else if(about=="")
  {
    setMessage(msg,"Enter About","error");
    return false;
  }
  else if(about.length<10)
  {
    setMessage(msg,"About too short","error");
    return false;
  }
  else if(pic==undefined)
  {
    setMessage(msg,"Select Profile Picture","error");
    return false;
  }
  else if(pic.type.split("/")[0]!="image")
  {
    setMessage(msg,"Invalid Picture","error");
    return false;
  }
  else if((pic.size/(1024*1024))>max_file_upload_size)
  {
    setMessage(msg,`Add File less that ${max_file_upload_size} MB`,"error");
    return false;
  }
  return true;
}
function toThirdPage()
{
  if(!isSecondPageValid())
  {
    return false;
  }
  resetMessage("#message-box-2");
  _(".pro").children[1].classList.add("active-box");
  window.location.hash="#box-3";
  scrollToNav(2);
  return true;
}
function isThirdPageValid()
{
  var msg="#message-box-3",phone=_("#phone").value,gender=$("[name='gender']:checked"),dob=_("#dob").value;
  if(phone=="")
  {
    setMessage(msg,"Enter phone number","error");
    return false;
  }
  else if(phone.length<10)
  {
    setMessage(msg,"Phone number too short","error");
    return false;
  }
  else if(phone.length>10)
  {
    setMessage(msg,"Phone number too long","error");
    return false;
  }
  else if(!/^[0-9]*$/.test(phone))
  {
    setMessage(msg,"Invalid Phone Number","error");
    return false;
  }
  else if(gender.length<1)
  {
    setMessage(msg,"Select gender","error");
    return false;
  }
  else if(dob=="")
  {
    setMessage(msg,"Invalid Date","error");
    return false;
  }
  return true;
}
function toFourthPage()
{
  if(!isThirdPageValid())
  {
    return false;
  }
  resetMessage("#message-box-3");
  _(".pro").children[2].classList.add("active-box");
  window.location.hash="#box-4";
  scrollToNav(3);
  return true;
}
function isFourthPageValid()
{
  var msg="#message-box-4",admnumber=_("#admnumber").value,admtype=_("#admtype"),admyear_raw=_("#admyear").value,idcard=_("#idcard");
  var admyear=pi(admyear_raw);
  admtype=admtype.selectedIndex<0?"":admtype.options[admtype.selectedIndex].value;
  if(admnumber=="")
  {
    setMessage(msg,"Enter Admission Number","error");
    return false;
  }
  else if(admnumber.length<4)
  {
    setMessage(msg,"Admission Number too short","error");
    return false;
  }
  else if(admnumber.length>15)
  {
    setMessage(msg,"Admission Number too long","error");
    return false;
  }
  else if(!/^[a-zA-Z0-9\-_]*$/.test(admnumber))
  {
    setMessage(msg,"Invalid Admission Number","error");
    return false;
  }
  else if(admtype=="")
  {
    setMessage(msg,"Select Admission Type","error");
    return false;
  }
  else if(admyear_raw=="")
  {
    setMessage(msg,"Select Admission Year","error");
    return false;
  }
  else if(isNaN(admyear) || admyear>(new Date().getFullYear()) || admyear<((new Date().getFullYear())-10))
  {
    setMessage(msg,"Invalid Admission Year","error");
    return false;
  }
  else if(!selectedImageOrPdf(idcard,"view-idcard",4))
  {
    setMessage(msg,"Select ID Card","error");
    return false;
  }
  return true;
}
function toFifthPage()
{
  if(!isFourthPageValid())
  {
    return false;
  }
  resetMessage("#message-box-4");
  _(".pro").children[3].classList.add("active-box");
  window.location.hash="#box-5";
  scrollToNav(4);
  return true;
}
function isFifthPageValid()
{
  var msg="#message-box-5",course=_("#course"),semester=_("#semester"),passout=_("#passout").value;
  course=course.selectedIndex<0?"":course.options[course.selectedIndex].value;
  semester=semester.selectedIndex<0?"":semester.options[semester.selectedIndex].value;
  if(course=="")
  {
    setMessage(msg,"Select Course","error");
    return false;
  }
  else if(semester=="")
  {
    setMessage(msg,"Select Semester","error");
    return false;
  }
  else if(passout=="")
  {
    setMessage(msg,"Select passout month and year","error");
    return false;
  }
  return true;
}
function toSixthPage()
{
  if(!isFifthPageValid())
  {
    return false;
  }
  resetMessage("#message-box-5");
  _(".pro").children[4].classList.add("active-box");
  window.location.hash="#box-6";
  scrollToNav(5);
  return true;
}
function isSixthPageValid()
{
  var msg="#message-box-6",sslcboard=_("#sslcboard"),sslcschool=_("#sslcschool").value,sslcpercent=_("#sslcpercent").value,sslcpassdate=_("#sslcpassdate").value,sslccertificate=_("#sslccertificate");
  sslcboard=sslcboard.selectedIndex<0?"":sslcboard.options[sslcboard.selectedIndex].value;
  if(sslcboard=="")
  {
    setMessage(msg,"Select board","error");
    return false;
  }
  else if(sslcschool=="")
  {
    setMessage(msg,"Enter School name","error");
    return false;
  }
  else if(sslcschool.length<3)
  {
    setMessage(msg,"School name too short","error");
    return false;
  }
  else if(sslcpercent<1 || sslcpercent>100)
  {
    setMessage(msg,"Invalid Mark (%)","error");
    return false;
  }
  else if(sslcpassdate=="")
  {
    setMessage(msg,"Select passout month & year","error");
    return false;
  }
  else if(!selectedImageOrPdf(sslccertificate,"view-sslccertificate",6))
  {
    setMessage(msg,"Select Certificate","error");
    return false;
  }
  return true;
}
function toSeventhPage()
{
  if(!isSixthPageValid())
  {
    return false;
  }
  resetMessage("#message-box-6");
  _(".pro").children[5].classList.add("active-box");
  window.location.hash="#box-7";
  scrollToNav(6);
  return true;
}
function isSeventhPageValid()
{
  var msg="#message-box-7",plustwoboard=_("#plustwoboard"),plustwoschool=_("#plustwoschool").value,plustwopercent=_("#plustwopercent").value,plustwopassdate=_("#plustwopassdate").value,plustwocertificate=_("#plustwocertificate");
  plustwoboard=plustwoboard.selectedIndex<0?"":plustwoboard.options[plustwoboard.selectedIndex].value;
  if(plustwoboard=="")
  {
    setMessage(msg,"Select board","error");
    return false;
  }
  else if(plustwoschool=="")
  {
    setMessage(msg,"Enter School name","error");
    return false;
  }
  else if(plustwoschool.length<3)
  {
    setMessage(msg,"School name too short","error");
    return false;
  }
  else if(plustwopercent<1 || plustwopercent>100)
  {
    setMessage(msg,"Invalid Mark (%)","error");
    return false;
  }
  else if(plustwopassdate=="")
  {
    setMessage(msg,"Select passout month & year","error");
    return false;
  }
  else if(!selectedImageOrPdf(plustwocertificate,"view-plustwocertificate",7))
  {
    setMessage(msg,"Select Certificate","error");
    return false;
  }
  return true;
}
function toEightthPage()
{
  if(!isSeventhPageValid())
  {
    return false;
  }
  resetMessage("#message-box-7");
  _(".pro").children[6].classList.add("active-box");
  window.location.hash="#box-8";
  scrollToNav(7);
  return true;
}
function isMultiFormCourseValid(n)
{
  var coursetype=_(`#coursetype-${n}`),coursename=_(`#coursename-${n}`).value,coursecollege=_(`#coursecollege-${n}`).value,coursecgpa=_(`#coursecgpa-${n}`).value,coursepassdate=_(`#coursepassdate-${n}`).value,coursecertificate=_(`#coursecertificate-${n}`);
  coursetype=coursetype.selectedIndex<0?"":coursetype.options[coursetype.selectedIndex].value;
  if(coursetype=="")
  {
    return {
      message:"Select Course type",
      type:"error"
    };
  }
  if(coursename=="")
  {
    return {
      message:"Enter Course Name",
      type:"error"
    };
  }
  else if(coursename.length<2)
  {
    return {
      message:"Course name too short",
      type:"error"
    };
  }
  else if(coursecollege=="")
  {
    return {
      message:"Enter College name",
      type:"error"
    };
  }
  else if(coursecollege.length<3)
  {
    return {
      message:"College name too short",
      type:"error"
    };
  }
  else if(coursecgpa<1 || coursecgpa>10)
  {
    return {
      message:"Invalid CGPA",
      type:"error"
    };
  }
  else if(coursepassdate=="")
  {
    return {
      message:"Select passout month & year",
      type:"error"
    };
  }
  else if(!selectedImageOrPdf(coursecertificate,`view-coursecertificate-${n}`,8))
  {
    return {
      message:"Select Certificate",
      type:"error"
    };
  }
  return {
    success:true
  };
}
function isEighthPageValid()
{
  var msg="#message-box-8";
  var n=$(".multiple-course").length;
  var success,haveUG=false;
  for(let i=0;i<n;i++)
  {
    var x=isMultiFormCourseValid(i+1);
    if(x.success!=true)
    {
      setMessage(msg,x.message,x.type);
      return false;
    }
    let coursetype=_(`#coursetype-${i+1}`);
    coursetype=coursetype.options[coursetype.selectedIndex].value;
    if(coursetype=="ug")
    {
      haveUG=true;
    }
  }
  if(!haveUG)
  {
    setMessage(msg,"Add atleast one UG","error");
    return false;
  }
  return true;
}
function toNinethPage()
{
  if(!isEighthPageValid())
  {
    return false;
  }
  resetMessage("#message-box-8");
  _(".pro").children[7].classList.add("active-box");
  window.location.hash="#box-9";
  scrollToNav(8);
  return true;
}
function isMultiFormExpAchValid(n,type)
{
  var xtype=_(`#${type}type-${n}`),
  title=_(`#${type}title-${n}`).value,
  description=_(`#${type}description-${n}`).value,
  from=_(`#${type}from-${n}`).value,
  to=_(`#${type}to-${n}`).value,
  certificate=_(`#${type}certificate-${n}`);
  xtype=xtype.selectedIndex<0?"":xtype.options[xtype.selectedIndex].value;
  var msg;
  if(type=="experience")
  {
    msg=9;
  }
  else if(type=="achievement")
  {
    msg=10;
  }
  if(xtype!="")
  {
    if(title=="")
    {
      return {
        message:`Enter ${type} title`,
        type:"error"
      };
    }
    else if(title.length<2)
    {
      return {
        message:`${type} title too short`,
        type:"error"
      };
    }
    else if(description=="")
    {
      return {
        message:"Enter description",
        type:"error"
      };
    }
    else if(description.length<10)
    {
      return {
        message:"Description too short",
        type:"error"
      };
    }
    else if(from=="")
    {
      return {
        message:"Select start month & year",
        type:"error"
      };
    }
    else if(to=="")
    {
      return {
        message:"Select end month & year",
        type:"error"
      };
    }
    else if(!selectedImageOrPdf(certificate,`view-${type}certificate-${n}`,msg))
    {
      return {
        message:"Select Certificate",
        type:"error"
      };
    }
    else
    {
      return {
        success:true
      };
    }
  }
  return {
    success:true,
    message:`Select ${type} type`,
    type:"warning"
  };
}
function isNinethPageValid()
{
  var msg="#message-box-9";
  var n=$(".multiple-experience").length;
  var success;
  for(let i=0;i<n;i++)
  {
    var x=isMultiFormExpAchValid(i+1,"experience");
    if(x.success!=true)
    {
      setMessage(msg,x.message,x.type);
      return false;
    }
  }
  return true;
}
function toTenthPage()
{
  if(!isNinethPageValid())
  {
    return false;
  }
  resetMessage("#message-box-9");
  _(".pro").children[8].classList.add("active-box");
  window.location.hash="#box-10";
  scrollToNav(9);
  return true;
}
function isTenthPageValid()
{
  var msg="#message-box-10";
  var n=$(".multiple-achievement").length;
  var success;
  for(let i=0;i<n;i++)
  {
    var x=isMultiFormExpAchValid(i+1,"achievement");
    if(x.success!=true)
    {
      setMessage(msg,x.message,x.type);
      return false;
    }
  }
  return true;
}
function toEleventhPage()
{
  if(!isTenthPageValid())
  {
    return false;
  }
  resetMessage("#message-box-10");
  _(".pro").children[9].classList.add("active-box");
  window.location.hash="#box-11";
  scrollToNav(10);
  return true;
}
function isEleventhPageValid()
{
  var msg="#message-box-11";
  if(_("#skill-view").children.length<5)
  {
    setMessage(msg,"Add atleast 5","error");
    return false;
  }
  else if(_("#skill-text").value!="")
  {
    setMessage(msg,"Click add before going to next","warning");
    return false;
  }
  return true;
}
function toTwelvethPage()
{
  if(!isEleventhPageValid())
  {
    return false;
  }
  resetMessage("#message-box-11");
  _(".pro").children[10].classList.add("active-box");
  window.location.hash="#box-12";
  scrollToNav(12);
  return true;
}
function finalSubmit(event)
{
  var loader=_("#loader");
  var msg="#message-box-12";
  for(let i=1;i<tabs;i++)
  {
    if(!isXthPageValid(i))
    {
      loader.innerHTML=warningIcon;
      setMessage(msg,`Complete details in page : ${i}`,"warning");
      exactScroll=true;
      window.location.hash=`#box-${i}`;
      //this delay is necessary
      setTimeout(function(){
        exactScroll=false;
      },scrollDelay*2)
      event.preventDefault();
      return false;
    }
  }
  _(".pro").children[11].classList.add("active-box");
  loader.innerHTML=`<div class='icon icon-load'>${loadingIcon}</div>`;
  return true;
}
