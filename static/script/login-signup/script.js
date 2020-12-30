var body,loginEmail,loginPassword,loginRemember;
const hiddenPassword=`<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
const visiblePassword=`<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="3" y1="3" x2="21" y2="21"></line></svg>`;
const _=key=>document.querySelector(key);
const $=key=>document.querySelectorAll(key);
const validateEmail=email=>/\S+@\S+\.\S+/.test(email);
window.onload=()=>{
  body=document.body;
  var loginNavButton=_("#nav-login");
  if(loginNavButton!==null)
  {
    loginNavButton.addEventListener("click",function(){
      event.preventDefault();
      _('#nav-bar').classList.remove('nav-bar-active');
      animateNext(event,'register-to-next',`register-wrapper`,`login-wrapper`);
    });
  }
  var SignupNavButton=_("#nav-signup");
  if(SignupNavButton!==null)
  {
    _("#nav-signup").addEventListener("click",function(){
      event.preventDefault();
      _('#nav-bar').classList.remove('nav-bar-active');
      animateNext(event,'login-to-next',`login-wrapper`,`register-wrapper`);
    });
  }
  _("#login-button").addEventListener("click",login);
  _("#register-button").addEventListener("click",register);
  loginEmail=_("#login-email");
  loginPassword=_("#login-password");
  loginRemember=_("#login-remember");
  registerEmail=_("#register-email");
  registerPassword=_("#register-password");
  registerConfirmPassword=_("#register-confirm-password");
  Array.from($(".togglePassword")).forEach(tbutton=>{
    tbutton.addEventListener("click",function(){
      const button=event.currentTarget;
      const target=_(`#${button.getAttribute("toggleTarget")}`);
      if(target.type=="password")
      {
        button.innerHTML=visiblePassword;
        target.type="text";
      }
      else
      {
        button.innerHTML=hiddenPassword;
        target.type="password";
      }
      button.blur();
    });
  });
  Array.from($(".clear")).forEach(clear=>{
    clear.addEventListener("click",resetPasswordAndMessages);
  });
};
function resetPasswordAndMessages(event)
{
  const button=event.currentTarget;
  button.getAttribute("buttonTarget").split(";").forEach(x=>{
    _(`#${x}`).innerHTML=hiddenPassword;
  });
  button.getAttribute("resetTarget").split(";").forEach(x=>{
    _(`#${x}`).type="password";
  });
  Array.from($(".message")).forEach(resetMessage);
  Array.from($("button[type='button']")).forEach(button=>{
    button.classList.remove("progress");
  });
}
function animateNext(event,id,wrapperclass,otherwrapperclass)
{
  const wrapper=_(`.${wrapperclass}`);
  if(wrapper.classList.contains("hidden"))
  {
    return;//return if on same page
  }
  const otherwrapper=_(`.${otherwrapperclass}`);
  const target=_(`.${id}`);
  const w=wrapper.getBoundingClientRect();
  var title=otherwrapperclass.split("-")[0].split("");
  title[0]=title[0].toUpperCase();
  title=title.join("");
  document.title=title;
  target.setAttribute("clip",0);
  const x=event.clientX-w.x;
  const y=event.clientY-w.y;
  target.setAttribute("clip-x",parseInt(x));
  target.setAttribute("clip-y",parseInt(y));
  requestAnimationFrame(()=>{
    animateNextFrame(target,wrapper,otherwrapper);
  });
}
function animateNextFrame(target,wrapper,otherwrapper)
{
  const p=0.5+parseFloat(target.getAttribute("clip"));
  const x=target.getAttribute("clip-x");
  const y=target.getAttribute("clip-y");
  target.setAttribute("clip",p);
  target.style.clipPath=`circle(${p}% at ${x}px ${y}px)`;
  if(p>155)
  {
    Array.from($(".clear")).forEach(clear=>{
      clear.click();
    });
    otherwrapper.classList.remove("hidden");
    otherwrapper.classList.add("visible");
    wrapper.classList.remove("visible");
    wrapper.classList.add("hidden");
    target.style.clipPath=`circle(0% at ${x}px ${y}px)`;
  }
  else
  {
    requestAnimationFrame(()=>{
      animateNextFrame(target,wrapper,otherwrapper);
    });
  }
}
function resetMessage(box)
{
  box.innerHTML="";
  box.classList.remove("error");
  box.classList.remove("warning");
  // box.classList.remove("info");
  // box.classList.remove("success");
}
function setMessage(element,form,message,input,type)
{
  const box=_(`#${form}-${input}-message`);
  resetMessage(box);
  box.innerHTML=message;
  box.classList.add(type);
  element.focus();
}
function login()
{
  const b=_("#login-button");
  if(b.classList.contains("progress"))
  {
    return;
  }
  const u=loginEmail.value;
  const p=loginPassword.value;
  const r=loginRemember.checked;
  if(u=="")
  {
    setMessage(loginEmail,"login","Enter User Id !","email","error");
    return;
  }
  else
  {
    resetMessage(_("#login-email-message"));
  }
  if(p=="")
  {
    setMessage(loginPassword,"login","Enter Password !","password","error");
    return;
  }
  else
  {
    resetMessage(_("#login-password-message"));
  }
  b.classList.add("progress");
  var formData={
    email:u,
    password:p,
    remember:r
  };
  var didLoginSucceede=false;
  fetch("/login",{
    method:"POST",
    cache:"no-cache",
    headers:{
      'Content-Type':'application/json'
    },
    body:JSON.stringify({
      raw:btoa(JSON.stringify(formData))
    }),
    credentials:"include"
  }).then(async response=>{
    await response.json().then(data=>{
      if(data.success===true)
      {
        didLoginSucceede=true;
        window.location=data.redirect;
      }
      else
      {
        if(data.devlog)
        {
          console.info(data.devlog);
        }
        setMessage(loginEmail,"login",data.message,"email","error");
      }
    }).catch(error=>{
      console.error(error.message);
      setMessage(loginEmail,"login","Server sent invalid response","email","error");
    });
  }).catch(error=>{
    console.error(error.message);
    setMessage(loginEmail,"login","Server not responding","email","error");
  }).finally(()=>{
    if(!didLoginSucceede)
    {
      b.classList.remove("progress");
    }
  });
}
function register()
{
  const b=_("#register-button");
  if(b.classList.contains("progress"))
  {
    return;
  }
  const u=registerEmail.value;
  const p=registerPassword.value;
  const c=registerConfirmPassword.value;
  if(u=="")
  {
    setMessage(registerEmail,"register","Enter User Id !","email","error");
    return;
  }
  else
  {
    resetMessage(_("#register-email-message"));
  }
  if(!validateEmail(u))
  {
    setMessage(registerEmail,"register","Invalid Email","email","error");
    return;
  }
  else
  {
    resetMessage(_("#register-email-message"));
  }
  if(p=="")
  {
    setMessage(registerPassword,"register","Enter Password !","password","error");
    return;
  }
  else
  {
    resetMessage(_("#register-password-message"));
  }
  if(p.length<8 || p.length>20)
  {
    setMessage(registerPassword,"register","length between 8 and 20","password","error");
    return;
  }
  else
  {
    resetMessage(_("#register-password-message"));
  }
  if(c=="")
  {
    setMessage(registerConfirmPassword,"register","Confirm Password !","confirm-password","error");
    return;
  }
  else
  {
    resetMessage(_("#register-confirm-password-message"));
  }
  if(p!=c)
  {
    setMessage(registerConfirmPassword,"register","Enter same password","confirm-password","warning");
    return;
  }
  else
  {
    resetMessage(_("#register-confirm-password-message"));
  }
  b.classList.add("progress");
  var formData={
    email:u,
    password:p
  };
  fetch("/register",{
    method:"POST",
    cache:"no-cache",
    headers:{
      'Content-Type':'application/json'
    },
    body:JSON.stringify({
      raw:btoa(JSON.stringify(formData))
    }),
    credentials:"include"
  }).then(response=>{
    response.json().then(data=>{
      if(data.success===true)
      {
        // // always to login
        // window.location=data.redirect;
        try
        {
          // // to animate instead of redirecting
          var box=_("#next-login-button").getBoundingClientRect();
          var customEvent={
            clientX:box["left"]+(box["width"]/2),
            clientY:box["top"]+(box["height"]/2)
          };
          setMessage(registerEmail,"register","Created Account","email","success");
          animateNext(customEvent,'register-to-next',`register-wrapper`,`login-wrapper`);
        }
        catch(err)
        {
          window.location=data.redirect;
        }
      }
      else
      {
        if(data.devlog)
        {
          console.info(data.devlog);
        }
        setMessage(registerEmail,"register",data.message,"email","error");
      }
    }).catch(error=>{
      console.error(error.message);
      setMessage(registerEmail,"register","Server sent invalid response","email","error");
    });
  }).catch(error=>{
    console.error(error.message);
    setMessage(registerEmail,"register","Server not responding","email","error");
  }).finally(()=>{
    b.classList.remove("progress");
  });
}
const closePopup=()=>{
  Array.from($(".popup")).forEach(pop=>{
    pop.parentNode.removeChild(pop);
  });
}
