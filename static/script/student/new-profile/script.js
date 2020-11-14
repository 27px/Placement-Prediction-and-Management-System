const _=s=>document.querySelector(s);
function setProgress(i,progress,total,unit)
{
  var dash=220;//SVG dash array
  progress=(progress>total)?total:progress;
  var cur=(progress*dash)/total;
  _('#svg_'+i+'_path').setAttribute("stroke-dasharray",cur+","+(dash-cur));
  _('#svg_'+i+'_text').innerHTML=progress+unit;
}
window.onload=()=>{
  var c=setInterval(()=>{
    var total=100;
    p=(parseInt(_('#svg_1_text').innerHTML)+1);
    setProgress("1",p,total,"s");
    if(p>=total)
    {
      clearInterval(c);
    }
  },1000);
};
