var body,loginEmail,loginPassword,loginRemember;
const hiddenPassword=`<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="feather feather-eye"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
const visiblePassword=`<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="feather feather-eye-off"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="3" y1="3" x2="21" y2="21"></line></svg>`;
const _=key=>document.querySelector(key);
const $=key=>document.querySelectorAll(key);
window.onload=()=>{
  body=document.body;
  _("#nav-login").addEventListener("click",function(){
    event.preventDefault();
    _('#nav-bar').classList.remove('nav-bar-active');
    animateNext(event,'register-to-next',`register-wrapper`,`login-wrapper`);
  });
  _("#nav-signup").addEventListener("click",function(){
    event.preventDefault();
    _('#nav-bar').classList.remove('nav-bar-active');
    animateNext(event,'login-to-next',`login-wrapper`,`register-wrapper`);
  });

  loginEmail=_("#login-email");
  loginPassword=_("#login-password");
  loginRemember=_("#login-remember");

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
    clear.addEventListener("click",resetPasswordInput);
  });
};
function resetPasswordInput(event)
{
  const button=event.currentTarget;
  button.getAttribute("buttonTarget").split(";").forEach(x=>{
    _(`#${x}`).innerHTML=hiddenPassword;
  });
  button.getAttribute("resetTarget").split(";").forEach(x=>{
    _(`#${x}`).type="password";
  });
}
function animateNext(event,id,wrapperclass,otherwrapperclass)
{
  const target=_(`.${id}`);
  const wrapper=_(`.${wrapperclass}`);
  const otherwrapper=_(`.${otherwrapperclass}`);
  const w=wrapper.getBoundingClientRect();
  target.setAttribute("clip",0);
  const x=event.clientX-w.x;
  const y=event.clientY-w.y;
  const t=setInterval(function(){
    const p=0.25+parseFloat(target.getAttribute("clip"));
    target.setAttribute("clip",p);
    target.style.clipPath=`circle(${p}% at ${x}px ${y}px)`;
    if(p>155)
    {
      clearTimeout(t);
      otherwrapper.classList.remove("hidden");
      otherwrapper.classList.add("visible");
      wrapper.classList.remove("visible");
      wrapper.classList.add("hidden");
      target.style.clipPath=`circle(0% at ${x}px ${y}px)`;
    }
  },1);
}
