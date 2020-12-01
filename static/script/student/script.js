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
  load(tab,callback);
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
  var randomScalingFactor = function() {
    return Math.round(Math.random() * 100);
  };
  var config = {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [
          randomScalingFactor(),
          randomScalingFactor(),
          randomScalingFactor(),
        ],
        backgroundColor: [
          "rgb(233,30,99)",
          "rgb(76,175,80)",
          "rgb(33,150,243)",
        ],
        label: 'Dataset 1'
      }],
      labels: [
        'Red',
        'Green',
        'Blue'
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio:false,
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Chart.js Doughnut Chart'
      },
      animation: {
        animateScale: true,
        animateRotate: true
      }
    }
  };
  var colorNames = Object.keys(window.chartColors);
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var xconfig = {
    type: 'line',
    data: {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [{
        label: 'My First dataset',
        backgroundColor: window.chartColors.red,
        borderColor: window.chartColors.red,
        data: [
          randomScalingFactor(),
          randomScalingFactor(),
          randomScalingFactor(),
          randomScalingFactor(),
          randomScalingFactor(),
          randomScalingFactor(),
          randomScalingFactor()
        ],
        fill: false,
      }, {
        label: 'My Second dataset',
        fill: false,
        backgroundColor: window.chartColors.blue,
        borderColor: window.chartColors.blue,
        data: [
          randomScalingFactor(),
          randomScalingFactor(),
          randomScalingFactor(),
          randomScalingFactor(),
          randomScalingFactor(),
          randomScalingFactor(),
          randomScalingFactor()
        ],
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio:false,
      title: {
        display: true,
        text: 'Chart.js Line Chart'
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
            labelString: 'Month'
          }
        }],
        yAxes: [{
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'Value'
          }
        }]
      }
    }
  };
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var color = Chart.helpers.color;
  var barChartData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [{
      label: 'Dataset 1',
      backgroundColor:"rgba(233,30,99,0.8)",
      borderColor: window.chartColors.red,
      borderWidth: 1,
      data: [
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor()
      ]
    }, {
      label: 'Dataset 2',
      backgroundColor:"rgba(33,150,243,0.8)",
      borderColor: window.chartColors.blue,
      borderWidth: 1,
      data: [
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor()
      ]
    }]
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
          position: 'top',
        },
        title: {
          display: true,
          text: 'Chart.js Bar Chart'
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
  // type attribute is used to refresh cache
  // it has no effect on results returned
  // user type is validated from session storage
  await fetch(`/data/sitemap?type=${userType}`,{
    // cache:"no-store"
    cache:"force-cache"
  }).then(response=>{
    response.json().then(searchItems=>{
      res.innerHTML="";
      searchItems.forEach(page=>{
        let k=page["key"].toLowerCase();
        if(high==1)
        {
          k=k.replace(v,"<span class='high'>"+v+"</span>");
        }
        if(rx.test(k))
        {
          let it=ce("a","item","",k);
          it.setAttribute("href",page["url"]);
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
