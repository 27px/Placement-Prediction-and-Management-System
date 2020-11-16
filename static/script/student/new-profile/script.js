const _=s=>document.querySelector(s);
const $=s=>document.querySelectorAll(s);
const pi=s=>parseInt(s);
var minute,second;
function setProgress(clock,progress,total,unit)
{
  var dash=220;//SVG dash array
  progress=(progress>total)?total:progress;
  var cur=(progress*dash)/total;
  _('#svg_'+clock+'_path').setAttribute("stroke-dasharray",cur+","+(dash-cur));
  _('#svg_'+clock+'_text').innerHTML=progress+unit;
}
function nextPage(event)
{
  const hash=window.location.hash;
  var no=false;
  var from=pi(hash.split("-")[1]);
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
  // if(hash!="")
  // {
  //   var next=_(`${hash}-next`);
  //   if(next!=null)
  //   {
  //     var from=pi(hash.split("-")[1]);
  //     var to=pi(event.currentTarget.href.split("#")[1].split("-")[1]);
  //     if(from>=to)
  //     {
  //       no=true;
  //     }
  //     if active navigate without validation and to any active box
  //     else if(_(".pro").children[to-1].classList.contains("active-box"))
  //     {
  //       // return;
  //       no=true;
  //     }
  //     else
  //     {
  //       event.preventDefault();
  //       next.click();
  //       return;
  //     }
  //   }
  //   else
  //   {
  //     no=true;
  //   }
  // }
  // else
  // {
  //   no=true;
  // }
  // if(no)
  // {
  //   var x=event.currentTarget.classList;
  //   if((!x.contains("active-box") || x.contains("no-visit")))
  //   {
  //     event.preventDefault();
  //     return false;
  //   }
  // }
}
window.onload=()=>{
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
  // window.re
};
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
function selectProfilePic()
{
  _("#profilepic").click();
}
function selectedProfilePic(element)
{
  var file=element.files[0];
  var preview=_(".real-preview");
  var alt=_("#alt-profile-pic");
  if(file!=undefined)
  {
    if(file.type.split("/")[0]!="image")
    {
      preview.src="";
      alt.classList.remove("hidden");
      setMessage("#message-box-2","Invalid Image","error");
      _("#view-profilepic").classList.remove("file-selected");
      _("#view-profilepic").classList.add("file-select-error");
      return;
    }
    try
    {
      var reader=new FileReader();
      reader.readAsDataURL(file);
      reader.onload=()=>{
        preview.src=reader.result;
        alt.classList.add("hidden");
        _("#view-profilepic").classList.remove("file-select-error");
        _("#view-profilepic").classList.add("file-selected");
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
      _("#view-profilepic").classList.remove("file-selected");
      _("#view-profilepic").classList.add("file-select-error");
    }
  }
  else
  {
    preview.src="";
    alt.classList.remove("hidden");
    _("#view-profilepic").classList.remove("file-selected");
    _("#view-profilepic").classList.add("file-select-error");
  }
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
  return true;
}
function isFourthPageValid()
{
  //
}
