const config=require("./config.json");

const DB_HOST=config.DB_SERVER.DB_HOST;
const DB_PORT=config.DB_SERVER.DB_PORT;
const DB_USER=encodeURIComponent(config.DB_SERVER.DB_USER);
const DB_PASSWORD=encodeURIComponent(config.DB_SERVER.DB_PASSWORD);
const DB_DATABASE=config.DB_SERVER.DB_DATABASE;

const DB_CONNECTION_URL=`mongodb://${(DB_USER!=""&&DB_PASSWORD!="")?`${DB_USER}:${DB_PASSWORD}@`:""}${DB_HOST}:${DB_PORT}/${DB_DATABASE}`;

module.exports=DB_CONNECTION_URL;
