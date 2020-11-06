const _=s=>document.querySelector(s);
const $=s=>document.querySelectorAll(s);
const createImage=(name,url,code)=>{
  var img=document.createElement("div");
  img.classList.add("preview");
  img.setAttribute("showtitle",name);
  img.style.backgroundImage=url;
  img.setAttribute("img-code",code);
  const close=document.createElement("div");
  close.classList.add("close");
  close.innerHTML="&times;";
  close.addEventListener("click",event=>{
    event.currentTarget.parentNode.parentNode.removeChild(event.currentTarget.parentNode);
  });
  img.appendChild(close);
  return img;
};
window.onload=()=>{
  Array.from($(".image")).forEach(img=>{
    img.addEventListener("click",slideshow)
  });
  document.body.addEventListener("keydown",event=>{
    if(event.keyCode==27)//esc
    {
      Array.from($(".close")).forEach(close=>close.click());
    }
    else
    {
      const preview=_(".preview");
      if(preview!=undefined)
      {
        var code=parseInt(preview.getAttribute("img-code"));
        if(event.keyCode==37)//left arrow
        {
          code--;
        }
        else if(event.keyCode==39)//right arrow
        {
          code++;
        }
        if(event.keyCode==37 || event.keyCode==39)
        {
          preview.setAttribute("img-code",code)
          var img=_(`#image-${code}`);
          if(img!=undefined)
          {
            preview.style.backgroundImage=img.style.backgroundImage;
          }
        }
      }
    }
  });
};
const slideshow=event=>{
  var image=event.currentTarget;
  const title=image.getAttribute("showtitle");
  const url=image.style.backgroundImage;
  const code=image.id.replace("image-","");
  const preview=createImage(title,url,code);
  Array.from($(".preview")).forEach(pre=>{
    pre.parentNode.removeChild(pre);
  });
  const previewContainer=_(".container");
  previewContainer.appendChild(preview);
};
