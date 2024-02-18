import * as mongoose from "mongoose"

let productSchema = new mongoose.Schema({
	_id: String,
	name: String,
	price: Number,
	isOrdered: Boolean
})

let Product = mongoose.model("Product", productSchema)

export {Product}