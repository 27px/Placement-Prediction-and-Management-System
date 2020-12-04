function purifyDescription(data)
{
  ["\r\n","\r","\n","\t",/[^a-zA-Z0-9 -]/].forEach(del=>{
    data=`${data}`.toString().split(del).join(" ");
  });
  return data.split(" ").map(word=>word.trim()).filter(word=>word!="").filter(word=>isNaN(parseInt(word)));
}

module.exports=purifyDescription;
