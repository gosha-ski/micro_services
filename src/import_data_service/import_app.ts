import * as amqp from "amqplib"
import * as express from "express"
import {pool} from "../database/db_connection"

let connection:any, channel:any
let req_import_queue = "req_import_queue"
let res_import_queue = "res_import_queue"

async function connectToRabbitmq(){
	connection = await amqp.connect("amqp://localhost")
	channel = await connection.createChannel()
	channel.assertQueue(req_import_queue)
	channel.assertQueue(res_import_queue)

}

connectToRabbitmq().then(()=>{
	channel.consume(req_import_queue, async function(msg:any){
		let products = (await pool.query(`SELECT * FROM products`)).rows
		console.log(products)
		channel.ack(msg)
		channel.sendToQueue(res_import_queue, Buffer.from(products))
	})
})

let app = express()

app.listen(3002, ()=>{
	console.log("import service works on port 3002")
})