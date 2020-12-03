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
function openTab(event)
{
  var target=event.currentTarget.getAttribute("data-target");
  _(`#${target}`).click();
}
function selectThisOption(event)
{
  var a=event.currentTarget;
  var p=a.parentNode;
  var x=p.children;
  var n=x.length,i=0;
  var toURL=a.getAttribute("toURL");
  var userType=p.getAttribute("data-user");
  for(i=0;i<n;i++)
  {
    x[i].classList.remove("nav-option-active");
  }
  a.classList.add("nav-option-active");
  document.title=a.innerText;
  var c=_("#maincontainer");
  c.innerHTML="<div class='loader'></div>";
  fetch(`/${userType}/dashboard/${toURL}`,{
    method:"POST",
    cahce:"no-store"
  }).then(response=>{
    if(response.status===200)
    {
      response.text().then(data=>{
        c.innerHTML=data;
        Array.from($(".link")).forEach(link=>{
          link.addEventListener("click",openTab);
        });
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
function createRecruiterAccount(event)
{
  event.preventDefault();
  var email=_("#email").value;
  var name=_("#name").value;
  var website=_("#website").value;
  var message=_("#create-account-message");
  if(email=="")
  {
    message.innerHTML="Enter E-Mail ID";
    return;
  }
  if(name=="")
  {
    message.innerHTML="Enter Company Name";
    return;
  }//website not mandatory
  event.currentTarget.classList.add("loading");
  message.innerHTML="";
  fetch("./dashboard/add-company-data",{
    method:"POST",
    cache:"no-store",
    headers:{
      'Content-Type':'application/json'
    },
    body:JSON.stringify({
      email,
      name,
      website
    })
  }).then(resp=>{
    if(resp.status===200)
    {
      return resp.json();
    }
    throw new Error("Status Error");
  }).then(data=>{
    if(data.message!=undefined)
    {
      message.innerHTML=data.message;
    }
    if(data.success)
    {
      window.location=data.redirect;
    }
  }).catch(error=>{
    console.log(error.message);
    message.innerHTML="Unknown Error occured";
  }).finally(()=>{
    _("#create-recruiter-account-button").classList.remove("loading");
  });
}
