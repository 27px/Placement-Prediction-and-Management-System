const _=id=>document.querySelector(id);
function selectThisOption(a,x)
{
  var n=x.length,i=0;
  for(i=0;i<n;i++)
  {
    x[i].classList.remove("nav-option-active");
  }
  a.classList.add("nav-option-active");
  document.title=a.innerHTML;
  var c=_("#maincontainer");
  c.innerHTML="<div class='loader'></div>";
  fetch(a.getAttribute("toURL"),{
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
    console.warn(error.message);
    c.innerHTML="<div class='loadererror'></div>";
  });
}
