import * as express from "express"
import * as amqp from "amqplib"
import * as mongoose from "mongoose"

let connection:any, channel:any
let req_import_queue = "req_import_queue"
let res_import_queue = "res_import_queue"

async function connectToRabbitmq(){
	connection = await amqp.connect("amqp://localhost")
	channel = await connection.createChannel()
	channel.assertQueue(req_import_queue)
	channel.assertQueue(res_import_queue)

}

connectToRabbitmq()

let app = express()

async function sendToImportService(req:any, res:any){
	let path = "helo helo"
	if(channel.checkQueue(req_import_queue)){
		channel.sendToQueue(req_import_queue, Buffer.from(path))

		channel.consume(res_import_queue, (msg:any)=>{
			console
			res.send(msg.content.toString())
		})
	}
}

app.get("/admin/import", sendToImportService)

app.listen(3001, ()=>{
	console.log("admin service works on port 3001")
})