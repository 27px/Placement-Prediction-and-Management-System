import TypeIt from "../../plugins/typeit.js/typeit.min.js";

var body;
var _=key=>document.querySelector(key);
var $=key=>document.querySelectorAll(key);

window.onload=()=>{
  body=document.body;
  Array.from($(".splash")).forEach(splash=>{
    splash.parentNode.removeChild(splash);
  });
  // typeit: subtitle
  var lines=[
    "Campus Placement Management System",
    "Skill Recommendation",
    "Placement Prediction",
    "External Jobs",
    "Previous year Placement Statistics",
    "Apply for Jobs",
    "Video Resources, E-Books, Tutorials"
  ];
  const l=new TypeIt("#lines",{loop:true});
  for(const line of lines)
  {
    l.type(line).pause(1000).delete(0-line.length);
  }
  l.go();
  // tupeit: box1
  var quotes=[
    "The future depends on what you do today.",
    "You get what you work for not what you wish for.",
    "You don't have to see the whole staircase, just take the first step.",
    "There are no secret to Success. It is the result of preperation, Hard Work and Learning from Failure.",
    "The only way to do great work, is to love what you do.",
    "Choose a job that you love, and you will never have to work a day in your life."
  ];
  const q=new TypeIt("#quote",{loop:true});
  for(const quote of quotes)
  {
    q.type(quote).pause(1000).delete(0-quote.length);
  }
  q.go();
  // Descriptions (THis is too slow)
  Array.from($(".type-title")).forEach(title=>{
    new TypeIt(title,{
      loop:false,
      speed:50,
      waitUntilVisible:true,
      cursor:false
    }).go();
  });

  //Initial scroll position
  scrolled();
};
function setScroll()
{
  if(body!=undefined || body!=null)
  {
    scrolled();
  }
}
window.onscroll=setScroll;
window.onresize=setScroll;
function scrolled()
{
  const H=body.clientHeight;
  var list=$(".animated");
  var i=0;
  for(var x of list)
  {
    var c=x.getBoundingClientRect();
    if(!c)
    {
      x.parentNode.classList.add("animated-box");
    }
    else
    {
      const top=c.y,height=c.height;
      if((top+(0.6*height))<H && top>(-0.4*height))
      {
        x.parentNode.classList.add("animated-box");
      }
      else
      {
        x.parentNode.classList.remove("animated-box");
      }
    }
  }
}
