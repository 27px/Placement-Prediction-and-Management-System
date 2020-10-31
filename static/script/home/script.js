import TypeIt from "../../plugins/typeit.js/typeit.min.js";

var body;
var _=id=>document.getELementById(id);
window.onload=()=>{
  body=document.body;
  // typeit: subtitle
  var lines=[
    "Campus Placement Management System",
    "Skill Recommendation",
    "Placement Prediction",
    "External Jobs",
    "Previous year Placement Statistics",
    "Video Resources, E-Books, Tutorials",
    "Practice MCQ Questions"
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
  Array.from(document.querySelectorAll(".type-title")).forEach(title=>{
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
window.onscroll=function(){
  if(body!=undefined || body!=null)
  {
    scrolled();
  }
};
function scrolled()
{
  var list=document.querySelectorAll(".animated");
  var s=body.scrollTop;
  for(var x of list)
  {
    var c=x.getBoundingClientRect();
    if(!c)
    {
      x.parentNode.classList.add("animated-box");
    }
    else
    {
      var v=c.y-(1*c.height);
      var f=c.y+(0.6*c.height);
      if(v<0 && f>0)
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
