import * as express from "express"
import * as mongoose from "mongoose"
import * as uniqid from "uniqid"
import * as bodyParser from "body-parser"
import {connectRabbitMQ} from "./product_channel"
import {Product} from "./product_model"

//console.log(mongoose.modelNames())

class ProductController{
	app = express()
	path = "/product"
	channel: any
	constructor(){
		this.app.use(bodyParser.json())
		this.initRoutes()
	}
	initRoutes(){
		this.app.get(this.path, this.getProducts)
		this.app.get(`${this.path}/:id`, this.buyProduct)
		this.app.post(`${this.path}`, this.createProduct)
	}

	async initMongo(){
		let connection = await mongoose.connect("mongodb://127.0.0.1:27017/fruits")
		console.log("connect to fruits")
	}

	async connectBroker(){
		let ch = await connectRabbitMQ()
		this.channel = ch

	}

	listenQueues(){
		this.channel.consume("order_cancel", async (msg:any)=>{
			console.log(msg.content.toString())
			let product_id = msg.content.toString()
			await Product.updateOne({_id: product_id}, {isOrdered: false})
			this.channel.ack(msg)
		}, {
			noAck:false
		})

		this.channel.consume("product_buy", async (msg:any)=>{
			console.log(msg.content.toString())
			let product_id = msg.content.toString()
			await Product.deleteOne({_id: product_id})
			this.channel.ack(msg)
		}, {
			noAck:false
		})
	}

	async createProduct(request:express.Request, response:express.Response){
		let data = request.body
		let product = new Product({
			_id: uniqid(),
			name: data.name,
			price: data.price,
			isOrdered: false
		})

		product.save()
	}


	async getProducts(request: express.Request, response: express.Response){
		let results = await Product.find({ isOrdered: false})
		response.send(results)
	
	}

	buyProduct = async (request: express.Request, response: express.Response)=>{
		let id = request.params.id
		let product = await Product.findById({_id: id})
		if(product && !product.isOrdered){
			let productJSON = JSON.stringify(product)
			this.channel.sendToQueue("order_create", Buffer.from(productJSON))
			await Product.updateOne({_id: id}, {isOrdered: true})
			response.send("product ordered")
		}else{
			response.send(`product with id ${id} not found`)
		}
	}

	listen(){
		this.app.listen(1200, ()=>{
			console.log("server works on 1200 port")
		})
	}
}

let product_service = new ProductController()

product_service.connectBroker().then(()=>{
	product_service.initMongo().then(()=>{
		product_service.listenQueues()
		product_service.listen()
	})
})


