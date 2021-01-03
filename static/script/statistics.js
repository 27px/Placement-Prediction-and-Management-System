const _=s=>document.querySelector(s);
const $=s=>document.querySelectorAll(s);
var xctx,config,zctx,barChartData;
function applyEffect(){
  xctx=_('#graph1').getContext('2d');
  window.myLine = new Chart(xctx, config);

  zctx=_('#graph2').getContext('2d');
  window.myBar = new Chart(zctx,{
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
window.onload=()=>{
  var data=JSON.parse(_("#data").innerHTML);
  var materialColorSet=[
    "rgb(244,67,54)",
    "rgb(156,39,176)",
    "rgb(63,81,181)",
    "rgb(3,169,244)",
    "rgb(0,150,136)",
    "rgb(139,195,74)",
    "rgb(255,235,59)",
    "rgb(255,152,0)",
    "rgb(255,87,34)",
    "rgb(233,30,99)",
    "rgb(103,58,183)",
    "rgb(33,150,243)",
    "rgb(0,188,212)",
    "rgb(76,175,80)",
    "rgb(205,220,57)",
    "rgb(255,193,7)"
  ];

  var materialColorSetSemiTransparent=[
    "rgba(244,67,54,0.8)",
    "rgba(103,58,183,0.8)",
    "rgba(33,150,243,0.8)",
    "rgba(0,188,212,0.8)",
    "rgba(76,175,80,0.8)",
    "rgba(205,220,57,0.8)",
    "rgba(255,193,7,0.8)",
    "rgba(255,87,34,0.8)",
    "rgba(233,30,99,0.8)",
    "rgba(156,39,176,0.8)",
    "rgba(63,81,181,0.8)",
    "rgba(3,169,244,0.8)",
    "rgba(0,150,136,0.8)",
    "rgba(139,195,74,0.8)",
    "rgba(255,235,59,0.8)",
    "rgba(255,152,0,0.8)"
  ];

  var gdata=[],g2data=[];

  var deplabel=new Set();
  data.forEach(depdatas=>{
    Object.keys(depdatas.departments).forEach(dlabel=>{
      deplabel.add(dlabel);
    });
  });

  Array.from(deplabel).forEach((dep,i)=>{
    var sdata=[];
    data.forEach(stat=>{
      sdata.push(stat.departments[dep]!=undefined?stat.departments[dep]:0);
    });
    gdata.push({
      label:dep,
      // backgroundColor:"rgba(0,0,0,1)",
      borderColor:materialColorSet[i%materialColorSet.length],
      data:sdata,
      pointBackgroundColor:materialColorSet[i%materialColorSet.length],
      fill:false
    });
    g2data.push({
      label:dep,
      backgroundColor:materialColorSetSemiTransparent[i%materialColorSetSemiTransparent.length],
      borderColor:"rgb(0,0,0)",
      data:sdata,
      fill:true
    });
  })
  var glabel=[];
  data.forEach(stat=>{
    glabel.push(stat.year);
  });
  config = {
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
  barChartData = {
    labels:glabel,
    datasets:g2data
  };
  applyEffect();
};
window.onresize=function(){
  window.location.reload();
};
