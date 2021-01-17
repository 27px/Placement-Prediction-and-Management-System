var body;
const _=id=>document.querySelector(id);
const $=key=>document.querySelectorAll(key);
const pf=x=>parseFloat(x);
function ce(e,c="",id="",content="")
{
  var el=document.createElement(e);
  if(c!="")
  {
    el.setAttribute("class",c);
  }
  if(id!="")
  {
    el.setAttribute("id",id);
  }
  if(content!="")
  {
    el.innerHTML=content;
  }
  return el;
}
function load(tab,callback)
{
  var container=_("#body");
  container.innerHTML="";
  container.appendChild(ce("div","loading"));
  fetch(`/student/dashboard/${tab}`,{
    method:"POST"
  }).then(response=>{
    if(response.status===200)
    {
      response.text().then(data=>{
        container.innerHTML=data;
      }).then(function(){
        var layout=_(".layout");
        if(layout!=null)
        {
          Array.from(layout.querySelectorAll(".item-link")).forEach(link=>{
            link.addEventListener("click",openTab);
          });
        }
        if(callback!=undefined)
        {
          callback();
        }
      });
    }
    else
    {
      loadingError();
    }
  }).catch(err=>{
    console.error(err);
    loadingError();
  });
}
window.onload=()=>{
  body=document.body;
  var tab="main";
  var open=_("#body").getAttribute("openTab");
  if(open!="")
  {
    tab=open;
  }
  var callback=()=>{};
  if(tab=="main")
  {
    callback=loadCharts;
  }
  load(tab,callback);
  Array.from($(".option")).forEach(option=>{
    option.addEventListener("click",openTab);
  });
};
function openTab(event)
{
  hideMenu();
  var tab=event.currentTarget.getAttribute("loadtab");
  if(tab==null)
  {
    return;
  }
  var callback=void(0);
  if(tab=="main")
  {
    callback=loadCharts;
  }
  if(tab=="drive")
  {
    callback=function(){
      Array.from($(".apply-button")).forEach(button=>{
        button.addEventListener("click",applyForInternalJob);
      });
    };
  }
  load(tab,callback);
}
function applyForInternalJob()
{
  var button=event.currentTarget;
  var url=`./dashboard/drive/${button.getAttribute("target")}/apply`;
  button.classList.add("progress");
  fetch(url,{
    method:"POST",
    cache:"no-store"
  }).then(response=>{
    if(response.status!==200)
    {
      throw new Error("Status Error");
    }
    return response.json();
  }).then(data=>{
    button.classList.remove("progress");
    if(data.success)
    {
      var xbt=document.createElement("div");
      xbt.classList.add("applied");
      xbt.innerHTML="Applied";
      button.replaceWith(xbt);
    }
    else
    {
      throw new Error(data.message!=undefined?data.message:"Failed");
    }
  }).catch(err=>{
    console.error(err.message);
    button.classList.remove("progress");
    button.classList.add("apply-button-failed");
  });
}
function toggleMenu()
{
  _("#seperator").style.display="block";
  _("#side").scrollTop=0;
  document.body.classList.toggle("show-menu");
  setTimeout(function(){
    if(!document.body.classList.contains("show-menu"))
    _("#seperator").style.display="none";
  },800);
  resetSearch();
}
function hideMenu()
{
  document.body.classList.remove("show-menu");
  setTimeout(function(){
    _("#seperator").style.display="none";
  },800);
}
function loadCharts()
{
  Array.from($(".website")).forEach(website=>{
    website.addEventListener("click",function(){
      var url=event.currentTarget.getAttribute("link");
      if(!url.startsWith("http"))
      {
        url=`http://${url}`;
      }
      window.open(url);
    });
  });
  var blueColorSet=[
    "rgb(13,71,161)",
    "rgb(21,101,192)",
    "rgb(25,118,210)",
    "rgb(30,136,229)",
    "rgb(33,150,243)",
    "rgb(66,165,245)",
    "rgb(100,181,246)",
    "rgb(144,202,249)",
    "rgb(187,222,251)",
    "rgb(227,242,253)"
  ];
  var graphData=_("#graphData").innerHTML;
  graphData=JSON.parse(graphData);
  var data1=[],label1=[];
  graphData.forEach(d=>{
    if(d["_id"]==null)
    {
      d["_id"]="Not Selected";
    }
    data1.push(d["count"]);
    label1.push(d["_id"]);
  });
  var config = {
    type: 'doughnut',
    data: {
      datasets: [{
        data:data1,
        backgroundColor:blueColorSet
      }],
      labels:label1
    },
    options: {
      responsive: true,
      maintainAspectRatio:false,
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text:'Number of Students this year'
      },
      animation: {
        animateScale: true,
        animateRotate: true
      }
    }
  };
  var statistical_data=JSON.parse(_("#graphData2").innerHTML);
  var gdata=[],g2data=[];

  var deplabel=new Set();
  statistical_data.forEach(depdatas=>{
    Object.keys(depdatas.departments).forEach(dlabel=>{
      deplabel.add(dlabel);
    });
  });

  Array.from(deplabel).forEach((dep,i)=>{
    var sdata=[];
    statistical_data.forEach(stat=>{
      sdata.push(stat.departments[dep]!=undefined?stat.departments[dep]:0);
    });
    gdata.push({
      label:dep,
      backgroundColor:"rgba(0,128,255,0.3)",
      borderColor:"rgb(13,71,161)",
      data:sdata,
      fill:true,
    });
    g2data.push({
      label:dep,
      backgroundColor:blueColorSet[i%blueColorSet.length],
      borderColor:"rgb(13,71,161)",
      data:sdata,
      fill:true,
    });
  });

  var glabel=[];
  statistical_data.forEach(stat=>{
    glabel.push(stat.year);
  });
  var colorNames = Object.keys(window.chartColors);
  var xconfig = {
    type: 'line',
    data: {
      labels:glabel,
      datasets:gdata
    },
    options: {
      responsive: true,
      maintainAspectRatio:false,
      title: {
        display: true,
        text: 'Previous Years Placement Statistics'
      },
      tooltips: {
        mode: 'index',
        intersect: false,
      },
      hover: {
        mode: 'nearest',
        intersect: true
      },
      scales: {
        xAxes: [{
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'Year'
          }
        }],
        yAxes: [{
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'Number of Recruits'
          }
        }]
      }
    }
  };
  var color = Chart.helpers.color;
  var barChartData = {
    labels:glabel,
    datasets:g2data
  };
  function applyEffect(){
    var ctx = _('#graph').getContext('2d');
    window.myDoughnut = new Chart(ctx, config);

    var xctx = _('#graph2').getContext('2d');
    window.myLine = new Chart(xctx, xconfig);

    var zctx = _('#graph3').getContext('2d');
    window.myBar = new Chart(zctx, {
      type: 'bar',
      data: barChartData,
      options: {
        responsive: true,
        maintainAspectRatio:false,
        legend: {
          position:'top',
        },
        title: {
          display: true,
          text:'Department wise yearly statistics'
        },
        scales: {
          xAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Year'
            }
          }],
          yAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Number of Recruits'
            }
          }]
        }
      }
    });
  };
  applyEffect();
}
function loadingError()
{
  var b=_("#body");
  b.innerHTML="";
  b.appendChild(ce("div","error"));
}
function searchItem(event,box)
{
  var min=1;//minimum number of characters required to start search
  var v=box.value.toLowerCase();
  var sc=_("#searchcontainer").getBoundingClientRect();
  var res=_("#searchresultcontainer");
  if(res==null)
  {
    res=ce("div","searchresultcontainer","searchresultcontainer");
  }
  if(isMinScreen())
  {
    _("#searchcontainermin").appendChild(res);
  }
  else
  {
    document.body.appendChild(res);
  }
  if(v.length>=min)
  {
    var rx=new RegExp("^"+(v.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g,'\\$&'))),x,y;
    res.innerHTML="";
    if(isMinScreen())
    {
      var ptop=pf(getComputedStyle(_('#side'))['paddingTop']);
      var scmin=getComputedStyle(_('#searchcontainermin'));
      x=ptop+"px";
      y=(ptop+pf(scmin['height']))+"px";
    }
    else
    {
      res.style.width=sc.width+"px";
      x=sc.left+"px";
      y=sc.height+sc.top+"px";
    }
    res.style.left=x;
    res.style.top=y;
    res.appendChild(ce("div","search-loading"));
    runSearch(rx,res,v,0,count=>{
      if(count<1 && v.length>=min)
      {
        res.appendChild(ce("div","search-loading"));
        rx=new RegExp(v.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
        runSearch(rx,res,v,1,count=>{
          if(count<1)
          {
            res.innerHTML="";
            res.appendChild(ce("div","item noresult","","No results"));
          }
        });
      }
    });
  }
  else
  {
    res.parentNode.removeChild(res);
  }
}
function isMinScreen()
{
  var min=600;
  return (document.body.getBoundingClientRect().width<min);
}
function resizeSearch()
{
  resetSearch(0);
  var i=_("#searchcontainer").children[0],o=_("#searchcontainermin").children[0];
  if(isMinScreen())
  {
    i=_("#searchcontainermin").children[0];
    o=_("#searchcontainer").children[0];
  }
  if(i.value=="")
  {
    i.value=o.value;
  }
  o.value="";
  setTimeout(function(){
    searchItem(null,i);
  },0);
}
async function runSearch(rx,res,v,high,callback)
{
  const userType=_("#searchcontainer").getAttribute("usertype");
  var count=0,s;
  await fetch(`/data/sitemap`,{
    cache:"no-store"
    // cache:"force-cache"
  }).then(response=>{
    response.json().then(searchItems=>{
      res.innerHTML="";
      searchItems.forEach(page=>{
        let k=page.key.toLowerCase();
        if(high==1)
        {
          k=k.replace(v,"<span class='high'>"+v+"</span>");
        }
        if(rx.test(k))
        {
          let it=ce("a","item","",k);
          it.setAttribute("href",page.url);
          it.setAttribute("target",page.newTab?"_blank":"_self");
          if(page.inlineTab)
          {
            it.addEventListener("click",openSearchedItemInTab.bind(event,it,page.url));
          }
          res.appendChild(it);
          count++;
        }
      });
      callback(count);
    }).catch(err=>{
      console.error(err.message);
      count=0;
    });
  }).catch(err=>{
    console.error(err.message);
    count=0;
  });
  return count;
}
function openSearchedItemInTab(a,url,event)
{
  event.preventDefault();
  openTab({
    currentTarget:{
      getAttribute:()=>{
        return url;
      }
    }
  });
  resetSearch();
}
function resetSearch(delay=400)
{
  var r=document.getElementsByClassName("searchresultcontainer");
  for(x of r)
  {
    x.classList.add("fade");
    setTimeout(function(){
      x.parentNode.removeChild(x);
    },delay);
  }
}
function logout()
{
  window.location="/logout";
}
function goHome()
{
  window.location="/home";
}
function searchExternalJob()
{
  var url="https://jobs.github.com/positions.json",search=[];
  var keyword=_("#external-job-search-keyword").value;
  var place=_("#external-job-search-place").value;
  var container=_("#external-job-search-result");
  container.innerHTML="<div class='loading high-contrast'></div>";
  if(keyword!="")
  {
    search.push(`description=${keyword}`);
  }
  if(place!="")
  {
    search.push(`location=${place}`);
  }
  search=encodeURI(search.join("&").replaceAll(" ","+"));
  if(search!="")
  {
    url+=`?${search}`;
  }
  fetch(`./dashboard/external/fetch`,{
    method:"POST",
    cache:"force-cache",
    headers:{
      'Content-Type':'application/json'
    },
    body:JSON.stringify({url})
  })
  .then(resp=>{
    if(resp.status!==200)
    {
      throw new Error("Status Error");
    }
    return resp.json();
  })
  .then(data=>{
    if(!data.success)
    {
      throw new Error(data.message);
    }
    container.innerHTML="";
    if(data.data.length>0)
    {
      data.data.forEach(job=>{
        container.innerHTML+=createJob(job);
      });
      container.innerHTML+="<div class='spacer'></div>";
    }
    else
    {
      container.innerHTML+=`
        <div class="external-job not-found">
          <div class="not-found"></div>
          <div class="text">No results found</div>
        </div>
      `;
    }
  })
  .catch(err=>{
    console.warn(err.message);
    container.innerHTML="<div class='error'></div>";
  });
}
function createJob(job)
{
  return `
    <div class="external-job">
      <div class="top">
        <a class="company" href="${job.company_url}">
          <img src="${job.company_logo}" class="logo">
          <div class="name">${job.company}</div>
        </a>
        <div class="title">${job.title}</div>
      </div>
      <div class="apply">
        <div class="short">
          <div class="type">${job.type}</div>
          <div class="location">${job.location}</div>
        </div>
        <div class="description">${job.description}</div>
        <div class="details">${job.how_to_apply}</div>
        <a class="apply-button" target="_blank" href="${job.url}">More Info</a>
      </div>
    </div>
  `;
}
function openInNewTab(url)
{
  window.open(url);
}
function recommendSkills()
{
  var text=_("#skill-recommendation-keyword"),keyword=text.value;
  if(keyword=="")
  {
    text.focus();
    return;
  }
  var container=_("#skill-recommendation-result");
  container.innerHTML="<div class='loading'></div>";
  fetch("./dashboard/recommendation/search",{
    method:"POST",
    cache:"no-store",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify({
      url:`https://jobs.github.com/positions.json?description=${keyword}`
    })
  }).then(resp=>{
    if(resp.status===200)
    {
      return resp.json();
    }
    throw new Error(`Status Error ${resp.status}`);
  }).then(data=>{
    if(data.success)
    {
      container.innerHTML="";
      if(data.data.length>0)
      {
        data.data.forEach(skill=>{
          container.innerHTML+=`<div class="skill">${skill}</div>`;
        });
      }
      else
      {
        container.innerHTML=`<div class="no-skill">Nothing found</div>`;
      }
    }
    else
    {
      container.innerHTML="<div class='error'></div>";
      if(data.message)
      {
        console.warn(data.message);
      }
      if(data.devlog)
      {
        console.error(data.devlog);
      }
    }
  }).catch(err=>{
    console.log(err.message);
    container.innerHTML="<div class='error'></div>";
  });
}
function showUpload()
{
  _("#file").click();
}
function uploadFile(e)
{
  var file=_("#file").files[0];
  if(Array.from($("a.file")).some(f=>f.children[1].innerHTML==file.name))
  {
    showPopUp("error",`Same filename exists for another file`);
    return;
  }
  var up=new FormData();
  up.append('file',file);
  fetch("./dashboard/resource/upload",{
    method:"POST",
    body:up
  }).then(resp=>{
    return resp.json()
  })
  .then(data=>{
    if(data.success)
    {
      showPopUp("success","Uploaded",()=>{
        openTab({
          currentTarget:{
            getAttribute:()=>'training-resources'
          }
        });
      });
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
  });
}
