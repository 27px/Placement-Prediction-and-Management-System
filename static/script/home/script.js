import TypeIt from "../../plugins/typeit.js/typeit.min.js";
var body;
window.onload=()=>{
  body=document.body;
  // typeit: subtitle
  var content=[
    "Campus Placement Management System",
    "Skill Recommendation",
    "Placement Prediction",
    "External Jobs",
    "Previous year Placement Statistics",
    "Video Resources, E-Books, Tutorials",
    "Practice MCQ Questions"
  ];
  const instance=new TypeIt("#lines",{loop:true});
  for(const str of content)
  {
    instance.type(str).pause(1000).delete(0-str.length);
  }
  instance.go();
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
