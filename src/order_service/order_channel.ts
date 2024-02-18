import * as amqp from "amqplib"

let ch1
async function connectRabbitMQ(){
	let connection = await amqp.connect("amqp://localhost")
	let channel = await connection.createChannel()
	await channel.assertQueue("order_create")
	await channel.assertQueue("order_cancel")
	await channel.assertQueue("product_buy")
	return channel
}
export {connectRabbitMQ}
