const _=s=>document.querySelector(s);
const $=s=>document.querySelectorAll(s);
const file_upload_max_size=12;
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
  Array.from($(".preview")).forEach(pre=>{
    pre.parentNode.removeChild(pre);
  });
  const image=event.currentTarget;
  const title=image.getAttribute("showtitle");
  const url=image.style.backgroundImage;
  const code=image.id.replace("image-","");
  const preview=createImage(title,url,code);
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
const testUpload=async(event)=>{
  var files=event.currentTarget.files;
  if(files.length<1)
  {
    showPopUp("warning","Nothing Selected");
    return;
  }
  var file=files[0];
  if(file.type.split("/")[0]!="image")
  {
    showPopUp("error","Invalid Type");
    return;
  }
  if(file.size/(1024*1024)>file_upload_max_size)
  {
    showPopUp("error",`File size Greater than ${file_upload_max_size}MB`);
    return;
  }
  popUpImageUploadPreview(uploadImage);
  var reader=new FileReader();
  reader.addEventListener("load",function(){
    var preview=_("#pop-up-upload-preview");
    if(preview!=undefined)
    {
      var ld=_(".pop-up-upload-loader");
      if(ld!=null)
      {
        ld.parentNode.removeChild(ld);
      }
      preview.src=reader.result;
    }
  });
  reader.readAsDataURL(file);
};
async function uploadImage()
{
  var title=_("#upload-title");
  if(title==undefined || title.value=="")
  {
    showPopUp("warning",`Enter Image Title`);
    return;
  }
  if(Array.from($(".image")).some(img=>img.getAttribute("showtitle")==title.value))
  {
    showPopUp("error",`Same title exists for another Image`);
    return;
  }
  var b=_(".up-button");
  if(b!=undefined)
  {
    b.classList.add("pop-up-loading-button");
  }
  var file=_("#up").files[0];
  var up=new FormData();
  up.append('image',file);
  var t=_("#upload-title");
  if(t!=undefined)
  {
    up.append('title',t.value);
  }
  await fetch("/gallery/upload",{
    method:"POST",
    body:up
  }).then(resp=>{
    return resp.json()
  })
  .then(data=>{
    if(data.success)
    {
      window.location.reload();
    }
    else
    {
      if(data.devlog!=undefined)
      {
        console.error(data.devlog);
      }
      showPopUp("error",data.message);
    }
  })
  .catch(err=>{
    console.log(err.message);
  }).finally(()=>{
    if(b!=undefined)
    {
      b.classList.remove("pop-up-loading-button");
    }
  });
}
