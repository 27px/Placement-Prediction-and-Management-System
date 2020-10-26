import TypeIt from "../../plugins/typeit.js/typeit.min.js";
window.onload=()=>{
  //typeit: subtitle
  var p=1000,content=["Campus Placement Management System","Skill Recommendation","Placement Prediction","External Jobs"];
  new TypeIt("#lines",{loop:true}).type(content[0]).pause(p).delete(0-document.getElementById("lines").innerText.length).type(content[1]).pause(p).delete(0-document.getElementById("lines").innerText.length).type(content[2]).pause(p).delete(0-document.getElementById("lines").innerText.length).type(content[3]).pause(p).delete(0-document.getElementById("lines").innerText.length).go();
};
