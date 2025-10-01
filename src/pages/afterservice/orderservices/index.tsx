import OrderCard from "@/components/Cards/OrderCard"

function OrderService(){


return(
    <div>
        <OrderCard 
        orderCode="a1" 
        operationDateTime="พรุ่งนี้"
        items={["ไก่", "หมู"]}
        status="กำลังทำงาน"
        totalPrice="2000"
        
        />
    </div>
)
}

export default OrderService