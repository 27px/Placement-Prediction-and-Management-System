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
  setArrows();
  return img;
};
window.onload=()=>{
  Array.from($(".image")).forEach(img=>{
    img.addEventListener("click",slideshow)
  });
  document.body.addEventListener("keydown",hkey);
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
  setArrows();
};
const setArrows=()=>{
  const preview=_(".preview");
  if(preview==undefined)
  {
    return;
  }
  Array.from($(".button")).forEach(button=>{
    button.parentNode.removeChild(button);
  });
  const code=parseInt(preview.getAttribute("img-code"));
  if(code>0)//left button
  {
    var left=document.createElement("div");
    left.classList.add("button");
    left.classList.add("button-left");
    left.addEventListener("click",()=>{
      hkey({keyCode:37});//left
    });
    preview.appendChild(left);
  }
  if(_(`#image-${code+1}`)!=undefined)//right button
  {
    var right=document.createElement("div");
    right.classList.add("button");
    right.classList.add("button-right");
    right.addEventListener("click",()=>{
      hkey({keyCode:39});//right
    });
    preview.appendChild(right);
  }
};
const hkey=event=>{
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
      var def=code;
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
        preview.setAttribute("img-code",code);
        var img=_(`#image-${code}`);
        if(img!=undefined)
        {
          preview.style.backgroundImage=img.style.backgroundImage;
        }
        else
        {
          preview.setAttribute("img-code",def);
        }
      }
    }
  }
  setArrows();
}
const upload=()=>{
  _("#up").click();
};
const testUpload=event=>{
  var f=event.currentTarget;
  fetch("/gallery",{
    method:"POST",
    body:f.files[0]
  }).then(resp=>{
    console.log(resp);
  }).catch(err=>{
    console.log(err.message);
  });
};
