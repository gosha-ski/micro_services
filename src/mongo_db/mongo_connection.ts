const MongoClient = require("mongodb").MongoClient

const client = new MongoClient("mongodb://127.0.0.1:27017/fruits")


client.connect().then((mongoClient:any)=>{
    console.log("Подключение установлено");
    console.log(mongoClient.options.dbName); // получаем имя базы данных
});