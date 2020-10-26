function _(id)
{
  return document.getElementById(id);
}
function pf(x)
{
  return parseFloat(x);
}
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
function toggleMenu()
{
  _("seperator").style.display="block";
  _("side").scrollTop=0;
  document.body.classList.toggle("showMenu");
  setTimeout(function(){
    if(!document.body.classList.contains("showMenu"))
    _("seperator").style.display="none";
  },800);
  resetSearch();
}
function hideMenu()
{
  document.body.classList.remove("showMenu");
  setTimeout(function(){
    _("seperator").style.display="none";
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
    var ctx = document.getElementById('graph').getContext('2d');
    window.myDoughnut = new Chart(ctx, config);

    var xctx = document.getElementById('graph2').getContext('2d');
    window.myLine = new Chart(xctx, xconfig);

    var zctx = document.getElementById('graph3').getContext('2d');
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
  var b=_("body");
  b.innerHTML="";
  b.appendChild(ce("div","error"));
}
function searchItem(event,box)
{
  var min=searchItems["option"].min;
  var v=box.value.toLowerCase();
  var sc=_("searchcontainer").getBoundingClientRect();
  var res;
  if(_('searchresultcontainer')==null)
  {
    res=ce("div","searchresultcontainer","searchresultcontainer");
  }
  else
  {
    res=_("searchresultcontainer");
  }
  if(isMinScreen())
  {
    _("searchcontainermin").appendChild(res);
  }
  else
  {
    document.body.appendChild(res);
  }
  if(v.length>=min)
  {
    var rx=new RegExp("^"+v.toLowerCase()),x,y;
    res.innerHTML="";
    if(isMinScreen())
    {
      var ptop=pf(getComputedStyle(_('side'))['paddingTop']);
      var scmin=getComputedStyle(_('searchcontainermin'));
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
    var count=runSearch(rx,res,v,0);
    if(count<1 && v.length>=min)
    {
      rx=new RegExp(v.toLowerCase());
      count=runSearch(rx,res,v,1);
    }
    if(count<1)
    {
      // res.parentNode.removeChild(res);
      res.innerHTML="";
      res.appendChild(ce("div","item noresult","","No results"));
    }
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
  var i=_("searchcontainer").children[0],o=_("searchcontainermin").children[0];
  if(isMinScreen())
  {
    i=_("searchcontainermin").children[0];
    o=_("searchcontainer").children[0];
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
function runSearch(rx,res,v,high)
{
  var count=0;
  searchItems["items"].forEach((item, i) => {
    let k=item["key"].toLowerCase();
    if(high==1)
    {
      k=k.replace(v,"<span class='high'>"+v+"</span>");
    }
    if(rx.test(k))
    {
      let it=ce("div","item","",k);
      it.setAttribute("url",item["url"]);
      it.addEventListener("click",function(){
        window.location=this.getAttribute("url");
      });
      res.appendChild(it);
      count++;
    }
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