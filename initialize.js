const chalk=require("chalk");
const child_process=require('child_process');
console.log(chalk.blue.inverse("Started"));
child_process.execSync('npm install',{stdio:[0,1,2]});
console.log(chalk.blue.inverse("Started"));
