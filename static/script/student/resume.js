const _=(s)=>document.querySelector(s);
const $=(s)=>document.querySelectorAll(s);
window.onload=()=>{
  Array.from($(".bar")).forEach(pro=>{
    pro.style.width=`${pro.getAttribute("data-progress")}%`;
  });
};
