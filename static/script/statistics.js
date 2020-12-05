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
  var blueColorSet=[
    "rgb(20,20,20)",
    "rgb(60,60,60)",
    "rgb(100,100,100)"
  ];

  console.log(data);
  var gdata=[],g2data=[];
  Object.keys(data[0].departments).forEach((dep,i)=>{
    var sdata=[];
    data.forEach(stat=>{
      sdata.push(stat.departments[dep]);
    });
    gdata.push({
      label:dep,
      backgroundColor:"rgba(0,0,0,0.2)",
      borderColor:"rgb(0,0,0)",
      data:sdata,
      fill:true,
    });
    g2data.push({
      label:dep,
      backgroundColor:blueColorSet[i%3],
      borderColor:"rgb(0,0,0)",
      data:sdata,
      fill:true,
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
