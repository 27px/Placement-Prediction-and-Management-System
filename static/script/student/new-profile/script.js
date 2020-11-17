const scrollDelay=1000;//important don't change // waits for next page to scroll into view to show next inline navigation
var scrollnumber=3;
max_file_upload_size=3;// In MB
const _=s=>document.querySelector(s);
const $=s=>document.querySelectorAll(s);
const pi=s=>parseInt(s);
var minute,second;
function scrollToNav(n)
{
  n=Math.min(n+scrollnumber,16);//17 elements (16 max index) scroll atleast 1 elements (scrollnumber)
  setTimeout(function(){
    _(".pro").children[n].scrollIntoView();
  },scrollDelay);
}
function setProgress(clock,progress,total,unit)
{
  var dash=220;//SVG dash array
  progress=(progress>total)?total:progress;
  var cur=(progress*dash)/total;
  _('#svg_'+clock+'_path').setAttribute("stroke-dasharray",cur+","+(dash-cur));
  _('#svg_'+clock+'_text').innerHTML=progress+unit;
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
  var no=false;
  var from=pi(hash.split("-")[1]);
  if(from==1)
  {
    if(!_(".pro").classList.contains("no-visit"))
    {
      event.preventDefault();
      setMessage(".message-box-1","Verify OTP before moving to next.","info");
      return;
    }
  }
  var to=pi(event.currentTarget.href.split("#")[1].split("-")[1]);
  if(isXthPageValid(from))
  {
    var x=event.currentTarget.classList;
    if((!x.contains("active-box") || x.contains("no-visit")))
    {
      event.preventDefault();
      var min=Math.min(16,to+1);
      for(let i=1;i<min;i++)
      {
        if(i==to || !isXthPageValid(i))
        {
          window.location.hash=`box-${i}`;
          return;
        }
      }
      return false;
    }
    else
    {
      window.location.hash=`box-${to}`;
    }
  }
  else
  {
    event.preventDefault();
    return false;
  }
}
window.onload=()=>{
  setScrollNumber();
  setCurrentInlineNavActive()
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
    })
  });
  _("#verify-otp").addEventListener("click",()=>{
    var otp="";
    Array.from(_(".otp-container").children).forEach(input=>{
      otp+=input.value;
    });
    otp=pi(otp);
    if(isNaN(otp))
    {
      setMessage(".message-box-1","Invalid OTP","error");
      return;
    }
    if(otp.toString().length<6)
    {
      setMessage(".message-box-1","Invalid OTP","error");
      return;
    }
    else
    {
      setMessage(".message-box-1","Loading . . .","info");
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
        setMessage(".message-box-1",data.message,"error");
        if(data.devlog!=undefined)
        {
          console.error(data.devlog);
        }
      }
      else
      {
        setMessage(".message-box-1",data.message,"success");
        clearOtpText();
        _(".pro").children[0].classList.add("active-box");
        _(".pro").children[0].classList.add("no-visit");//only for otp
        window.location.hash="#box-2";
      }
    })
    .catch(err=>{
      console.error(err.message);
      setMessage(".message-box-1","Unknown error","error");
    });
  });
  _("#otp-1").focus();
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
        /// when timer hits zero
        setProgress("minute",0,60," m");
        setProgress("second",0,60," s");
        clearInterval(t);
        _("#first-tab").innerHTML=`
        <div class="row">
          <div class="title">OTP Expired</div>
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
function toggleDiploma(checkbox)
{
  var wrapper=_("#diploma-diabler").classList;
  if(checkbox.checked)
  {
    wrapper.remove("disabled");
  }
  else
  {
    wrapper.add("disabled");
    resetMessage("#message-box-8");
  }
}
function setMessage(selector,message,type)
{
  var m=_(selector);
  resetMessage(selector);
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
  var file=element.files[0];
  var x=_(`#${id}`);
  if(file!=undefined)
  {
    if(!(file.type.split("/")[0]=="image" || file.type=="application/pdf"))
    {
      setMessage(`#message-box-${m}`,"Invalid File Type","error");
      x.classList.remove("file-selected");
      x.classList.add("file-select-error");
      return false;
    }
    else if((file.size/(1024*1024))>max_file_upload_size)
    {
      setMessage(`#message-box-${m}`,`Add File size < ${max_file_upload_size} MB`,"error");
      x.classList.remove("file-selected");
      x.classList.add("file-select-error");
      return false;
    }
    else
    {
      x.classList.remove("file-select-error");
      x.classList.add("file-selected");
      return true;
    }
  }
  else
  {
    x.classList.remove("file-selected");
    x.classList.add("file-select-error");
    return false;
  }
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
    result=isTwelvethPageValid();
  }
  else if(num==13)
  {
    result=isThirteenthPageValid();
  }
  else if(num==14)
  {
    result=isFourteenthPageValid();
  }
  else if(num==15)
  {
    result=isFifteenthPageValid();
  }
  else if(num==16)
  {
    result=isSixteenthPageValid();
  }
  else if(num==17)
  {
    result=isSeventeenthPageValid();
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
  var msg="#message-box-2",name=_("#name").value,bio=_("#bio").value,pic=_("#profilepic").files[0];
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
  else if(bio=="")
  {
    setMessage(msg,"Enter Bio","error");
    return false;
  }
  else if(bio.length<10)
  {
    setMessage(msg,"Bio too short","error");
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
  admtype=admtype.options[admtype.selectedIndex].value;
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
  course=course.options[course.selectedIndex].value;
  semester=semester.options[semester.selectedIndex].value;
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
  sslcboard=sslcboard.options[sslcboard.selectedIndex].value;
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
    setMessage(msg,"Enter passout month & year","error");
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
  plustwoboard=plustwoboard.options[plustwoboard.selectedIndex].value;
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
    setMessage(msg,"Enter passout month & year","error");
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
function isEighthPageValid()
{
  var msg="#message-box-8",diploma=_("#diploma"),diplomacourse=_("#diplomacourse").value,diplomacollege=_("#diplomacollege").value,diplomapercent=_("#diplomapercent").value,diplomapassdate=_("#diplomapassdate").value,diplomacertificate=_("#diplomacertificate");
  if(diploma.checked)
  {
    if(diplomacourse=="")
    {
      setMessage(msg,"Enter Course Name","error");
      return false;
    }
    else if(diplomacourse.length<2)
    {
      setMessage(msg,"Course name too short","error");
      return false;
    }
    else if(diplomacollege=="")
    {
      setMessage(msg,"Enter College name","error");
      return false;
    }
    else if(diplomacollege.length<3)
    {
      setMessage(msg,"College name too short","error");
      return false;
    }
    else if(diplomapercent<1 || diplomapercent>100)
    {
      setMessage(msg,"Invalid Mark (%)","error");
      return false;
    }
    else if(diplomapassdate=="")
    {
      setMessage(msg,"Enter passout month & year","error");
      return false;
    }
    else if(!selectedImageOrPdf(diplomacertificate,"view-diplomacertificate",7))
    {
      setMessage(msg,"Select Certificate","error");
      return false;
    }
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
