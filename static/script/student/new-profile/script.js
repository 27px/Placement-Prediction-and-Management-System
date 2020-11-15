const _=s=>document.querySelector(s);
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
  if(!event.currentTarget.classList.contains("active-box"))
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
};
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
      }
      //Minute
    }
    //Second
  },1000);//1000 milliseconds
}
