const _=selector=>document.querySelector(selector);
const $=selector=>document.querySelectorAll(selector);
window.onload=(event)=>{
  //fake event
  selectThisOption({
    currentTarget:_(".nav-option")
    //selects only first element
  });
  Array.from($(".nav-option")).forEach(nav=>{
    nav.addEventListener("click",selectThisOption);
  });
};
function selectThisOption(event)
{
  var a=event.currentTarget;
  var p=a.parentNode;
  var x=p.children;
  var n=x.length,i=0;
  var userType=p.getAttribute("data-user");
  for(i=0;i<n;i++)
  {
    x[i].classList.remove("nav-option-active");
  }
  a.classList.add("nav-option-active");
  document.title=a.innerHTML;
  var c=_("#maincontainer");
  c.innerHTML="<div class='loader'></div>";
  fetch(`/${userType}/dashboard/${a.getAttribute("toURL")}`,{
    method:"POST",
    cahce:"no-store"
  }).then(response=>{
    if(response.status===200)
    {
      response.text().then(data=>{
        c.innerHTML=data;
      });
    }
    else
    {
      throw new Error(`Status Error : ${response.status}`);
    }
  }).catch(error=>{
    c.innerHTML="<div class='loadererror'></div>";
    console.warn(error.message);
  });
}
