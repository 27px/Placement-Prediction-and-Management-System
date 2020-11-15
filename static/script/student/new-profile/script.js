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
  var x=event.currentTarget.classList;
  if((!x.contains("active-box") || x.contains("no-visit")))
  {
    event.preventDefault();
    return false;
  }
}
window.onload=()=>{
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
    otp=parseInt(otp);
    if(isNaN(otp))
    {
      setMessage(".message-otp","Invalid OTP","error");
      return;
    }
    if(otp.toString().length<6)
    {
      setMessage(".message-otp","Invalid OTP","error");
      return;
    }
    else
    {
      setMessage(".message-otp","Loading . . .","info");
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
        setMessage(".message-otp",data.message,"error");
        if(data.devlog!=undefined)
        {
          console.error(data.devlog);
        }
      }
      else
      {
        setMessage(".message-otp",data.message,"success");
        clearOtpText();
        _(".pro").children[0].classList.add("active-box");
        _(".pro").children[0].classList.add("no-visit");//only for otp
        window.location.hash="#box-2";
      }
    })
    .catch(err=>{
      console.log(err.message);
      setMessage(".message-otp","Unknown error","error");
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
    var next=_(`#otp-${parseInt(this.id.replace("otp-",""))+1}`);
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
          <button type="button" class="b-blue" onclick="window.location.reload();">Resend</button>
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
  resetMessage(m);
  m.innerHTML=message;
  m.classList.add("m-"+type);
}
function resetMessage(m)
{
  m.innerHTML="";
  m.classList.remove("m-success");
  m.classList.remove("m-info");
  m.classList.remove("m-warning");
  m.classList.remove("m-error");
}
