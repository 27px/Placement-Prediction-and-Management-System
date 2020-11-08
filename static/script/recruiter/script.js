function _(id)
{
  return document.getElementById(id);
}
function toggleMenu(x)
{
  var m=_("menu").classList;
  if(x.contains("hiddenmenu"))
  {
    x.remove("hiddenmenu");
    m.add("showmenu");
  }
  else
  {
    x.add("hiddenmenu");
    m.remove("showmenu");
  }
}
function ajax(url)
{
  var x;
	if(window.XMLHttpRequest)
	{
		x=new XMLHttpRequest();
	}
	else
	{
	  x=new ActiveXObject("Microsoft.XMLHTTP");
	}
	x.onreadystatechange=function(){
    var c=_("maincontainer");
    if(this.readyState==4)
    {
      if(this.status==200)
      {
        c.innerHTML=this.responseText;
      }
      else
      {
        c.innerHTML="<div class='loadererror' style='background-image:url(images/warning.svg);'></div>";
      }
    }
  };
	x.open("POST",url,true);
	x.send();
}
function selectThisOption(a,x)
{
  var n=x.length,i=0;
  for(i=0;i<n;i++)
  {
    x[i].classList.remove("nav-option-active");
  }
  a.classList.add("nav-option-active");
  document.title=a.innerHTML;
  var c=_("maincontainer");
  c.innerHTML="<div class='loader' style='background-image:url(images/loader.gif);'></div>";
  var m=_("menu").classList;
  var tx=_('main').classList;
  tx.add("hiddenmenu");
  m.remove("showmenu");
  ajax(a.getAttribute("toURL"));
}
function keyOption(x,y)
{
  if(y.keyCode=="13")
  {
    x.click();
  }
}
function switchTheme(s)
{
  s.blur();
  document.body.setAttribute("class",s.options[s.selectedIndex].innerHTML.toLowerCase().replace(" ","")+"theme");
  _("doctheme").setAttribute("content",s.options[s.selectedIndex].value);
}
