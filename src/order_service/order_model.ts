import * as mongoose from "mongoose"

let orderSchema = new mongoose.Schema({
	_id: String,
	product_id: String,
	date: Date
})

let Order = mongoose.model("Order", orderSchema)
export {Order}