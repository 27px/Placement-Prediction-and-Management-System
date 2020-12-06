const child_process=require('child_process');
const fs=require("fs");

console.log("\nStarted\n\n");
try
{
  child_process.execSync('npm install',{stdio:[0,1,2]});
}
catch(error)
{
  console.log(error.message);
}
finally
{
  const dir='./data';
  try
  {
    if(!fs.existsSync(dir))
    {
      fs.mkdirSync(dir);
    }
    else
    {
      console.log("Data Directory Exists");
    }
  }
  catch(error)
  {
    console.log(error.message);
  }
  finally
  {
    const paths=["gallery","profilepic","idcard","certificate","resource"];
    paths.forEach(p=>{
      path=`${dir}/${p}`;
      if(!fs.existsSync(path))
      {
        fs.mkdirSync(path);
      }
      else
      {
        console.log(`\n${p} Directory Exists, make sure to check contents`);
      }
    });
  }
}
console.log("\n\nCompleted");
