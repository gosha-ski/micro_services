import * as express from "express"
import {connectRabbitMQ} from "./check_channel"

class CheckService{
	app =express()
	channel:any 
	port = 1202

	async connectBroker(){
		let ch = await connectRabbitMQ()
		this.channel = ch
	}

	listen(){
		this.app.listen(1202, ()=>{
			console.log("check_service work on port 1202")
		})

		setInterval(()=>{
			console.log(this.port)

		}, 1000)
	}

}

let app = new CheckService()

app.connectBroker().then(()=>{
	app.listen()
})