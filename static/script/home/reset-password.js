const _=s=>document.querySelector(s);
const $=s=>document.querySelectorAll(s);
const ce=(tag="div",className="",id="",name="",content="",attr,events)=>{
  var element=document.createElement(tag);
  if(!!className)
  element.setAttribute("class",typeof(className)==typeof([])?className.join(" "):className);
  if(!!id)
  element.id=id;
  if(!!name)
  element.name=name;
  if(!!content)
  element.innerHTML=content;
  if(typeof(attr)==typeof({}))
  {
    Object.keys(attr).forEach(attribute=>{
      element.setAttribute(attribute,attr[attribute]);
    });
  }
  if(!!events)
  events.forEach(even=>{
    even.event.forEach(evt=>{
      element.addEventListener(evt,even.handler);
    });
  });
  return element;
};
const newForm=email=>{
  var form=ce(undefined,"second-form");
  form.appendChild(ce("input",undefined,"otp-input",undefined,undefined,{
    placeholder:"OTP"
  }));
  form.appendChild(ce("input",undefined,"new-password",undefined,undefined,{
    type:"password",
    placeholder:"New Password",
    maxlength:20
  }));
  form.appendChild(ce("input",undefined,"confirm-password",undefined,undefined,{
    type:"password",
    placeholder:"Confirm Password",
    maxlength:20
  }));
  var button=ce("button",undefined,undefined,undefined,undefined,{
    type:"button",
    "data-email":email
  },[
    {
      event:["click"],
      handler:resetPassword
    }
  ]);
  button.appendChild(ce("div",undefined,undefined,undefined,"Reset"));
  button.innerHTML+=`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>`;
  form.appendChild(button);
  return form;
};
function resetPassword()
{
  const otp=_("#otp-input").value;
  const password=_("#new-password").value;
  const confirmPassword=_("#confirm-password").value;
  if(otp=="")
  {
    showPopUp("warning","Enter OTP");
    return;
  }
  if(password=="")
  {
    showPopUp("warning","Enter Password");
    return;
  }
  if(password.length<8 || password.length>20)
  {
    showPopUp("warning","Password length should be between 8 and 20");
    return;
  }
  if(confirmPassword=="")
  {
    showPopUp("warning","Confirm Password");
    return;
  }
  if(password!=confirmPassword)
  {
    showPopUp("warning","Password should match confirm password");
    return;
  }
  var email=event.currentTarget.getAttribute("data-email");
  fetch("password",{
    method:"POST",
    cache:"no-store",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify({
      otp,
      password,
      email
    })
  })
  .then(resp=>{
    throw new Error("Test Error");

    if(resp.status!==200)
    {
      throw new Error(`Status Error ${resp.status}`);
    }
    return resp.json();
  })
  .then(data=>{
    if(!data.success)
    {
      console.warn(err.message);
      throw new Error(data.message);
    }
    else
    {
      window.location="/login";
    }
  })
  .catch(err=>{
    console.error(err.message);
    showPopUp("error",err.message || "Something went wrong",()=>{
      window.location.reload();
    });
  });
}
window.onload=()=>{
  var container=_("#container");
  var button=_("#send-verification");
  var form=_(".form");
  button.addEventListener("click",()=>{
    var email=_("#email").value;
    if(email=="")
    {
      showPopUp("warning","Enter E-Mail ID");
      return;
    }
    if(!/\S+@\S+\.\S+/.test(email))
    {
      showPopUp("error","Invalid E-Mail ID");
      return;
    }
    var loader=ce(undefined,"progress");
    container.innerHTML="";
    container.appendChild(loader);
    fetch("/reset/password/otp",{
      method:"POST",
      cache:"no-store",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        email
      })
    }).then(resp=>{
      if(resp.status===200)
      {
        return resp.json();
      }
      throw new Error(`Status Error : ${resp.status}`);
    }).then(data=>{
      if(!data.success)
      {
        throw {
          name:"customError",
          message:data.message || "failed to load"
        };
      }
      else
      {
        container.innerHTML="";
        container.appendChild(newForm(email));
      }
    }).catch(err=>{
      console.error(err.message);
      showPopUp("error",err.name=="customError"?err.message:"Something went wrong",()=>{
        window.location.reload();
      });
    });
  });
};
