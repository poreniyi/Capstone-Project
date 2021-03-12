let path= require('path');
require('dotenv').config({path:path.resolve(__dirname,'../.env')});

console.log(process.env.GMaps_Key);