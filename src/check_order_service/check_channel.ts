import * as amqp from "amqplib"

async function connectRabbitMQ(){
	let connection = await amqp.connect("amqp://localhost")
	let channel = await connection.createChannel()
	await channel.assertQueue("order_check")
	await channel.assertQueue("order_response")
	return channel
}
export {connectRabbitMQ}
