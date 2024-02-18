import {Order} from "../order_model"

async function deleteOrder(order_id:string){
	let order = await Order.findById({_id: order_id})
	if(order){
		await Order.deleteOne({_id: order_id})
		return `order <${order_id}> successful deleted`
	}else{
		return `order <${order_id}> not found`
	}
}

export {deleteOrder}