import * as express from "express"
import * as mongoose from "mongoose"
import * as uniqid from "uniqid"
import * as bodyParser from "body-parser"
import {connectRabbitMQ} from "./order_channel"
import {Order} from "./order_model"
import {deleteOrder} from "./helpers/deleteOrder"

console.log(mongoose.modelNames())

class OrderController{
	app = express()
	channel:any
	path = "/orders"

	constructor(){
		this.initRoutes()
	}

	initRoutes(){
		this.app.get(this.path, this.getAllOrders)
		this.app.get(`${this.path}/:id`, this.getOrderById.bind(this))
		this.app.delete(`${this.path}/:id`, this.deleteOrderById.bind(this))
	}

	async connectMongo(){
		let connection:any = await mongoose.connect("mongodb://127.0.0.1:27017/orders")
		console.log("connected to orders")
	}

	async connectBroker(){
		let ch = await connectRabbitMQ()
		this.channel = ch
		
	}

	initBehavior(){
		if(this.channel){
			this.channel.consume("order_create", (msg:any)=>{
				let product = JSON.parse(msg.content.toString())
				this.channel.ack(msg)
				let order = new Order({
					_id: uniqid(),
					product_id: product._id,
					date: new Date()
				})

				order.save()
			}, {
				noAck:false
			})	
		}
	}

	async getAllOrders(request: express.Request, response: express.Response){
		let orders = await Order.find()
		response.send(orders)
	}



	async getOrderById(request: express.Request, response: express.Response){
		let order_id = request.params.id

		let order = await Order.findById({_id: order_id})
		if(order){
			response.send(order)
		}else{
			response.send(`order ${order_id} not found`)
		}
	}

	async deleteOrderById(request: express.Request, response: express.Response){
		let action = request.query.action
		let order_id = request.params.id
		if(action=="buy"){
			let order:any = await Order.findById({_id: order_id})
			if(order){
				deleteOrder(order_id).then((data:any)=>{
					this.channel.sendToQueue("product_buy", Buffer.from(order.product_id))
					response.send(data)
			})
			}else{
				response.send(`order <${order_id}> not found`)
			}
		}else if(action=="cancel"){
			let order:any = await Order.findById({_id: order_id})
			if(order){
				await deleteOrder(order_id)
				this.channel.sendToQueue("order_cancel", Buffer.from(order.product_id))
				response.send(`order <${order_id}> cancelled`)
			}else{
				response.send(`order <${order_id}> not found`)
			}
		}
	}

	listen(){
		this.app.listen(1201, ()=>{
			console.log("server works on 1201 port")
		})
	}

}

let order_controller = new OrderController()

order_controller.connectBroker().then(()=>{
	order_controller.connectMongo().then(()=>{
		order_controller.initBehavior()
		order_controller.listen()
	})
})
