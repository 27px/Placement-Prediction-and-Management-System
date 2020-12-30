const _=(s)=>document.querySelector(s);
const $=(s)=>document.querySelectorAll(s);
const icon=`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>`;
window.onload=()=>{
  Array.from($(".bar")).forEach(pro=>{
    pro.style.width=`${pro.getAttribute("data-progress")}%`;
  });
  Array.from($(".certificate")).forEach(certificate=>{
    certificate.innerHTML=icon;
    certificate.addEventListener("click",viewCertificate);
  });
};
const viewCertificate=()=>{
  window.open(event.currentTarget.getAttribute("link"));
};
