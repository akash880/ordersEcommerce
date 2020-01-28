const createOrder=(req,res)=>{

}


 function checkItemPresent(productId, quantity,connection){
  if(productId && quantity){

    connection.query(`select count(1) as cnt from products where id=${productId} and quantity >= ${quantity}`,
    (err,rows)=>{


    });

  }else{
    throw "missing";
  }

 }
const addToCart = async (req,res)=>{

  // check if item is present , 
  // If item is present add it to tbl_cart_master  cart_id, user_id,product_id,status(1-- in cart, 2 --placed )
  let connection = req.db;
  let productId = req.body.productId;
  let quantity = req.body.quantity;
  let user_id = req.body.userId;
  let cart_id= Math.floor(new Date().valueOf() * Math.random());  // will make it in common function 
  let checkQuantity = await  checkItemPresent(productId,quantity, connection);

  if(checkQuantity){
    // insert into tbl_cart_master if item is present and status is 1 that means item is alredy added in the cart and user wants to update the quantity 
    //this can also be done by sending the cartid but for now lets search the item in the carts of the user
    // else its a new item which user wants to add in the cart
    let checkAlredyPresent =  `select count(1) as cnt , cart_id from tbl_cart_master where  product_id=${productId} and status=1 and user_id = ${user_id} `
    req.db.query(checkAlredyPresent, (err,rows) => {
      if(rows[0].cnt > 0){
        let updateQuantity = `UPDATE tbl_cart_master SET quantity_placed = ${quantity} WHERE product_id=${productId} and status=1 and user_id = ${user_id}`;
        req.db.query(updateQuantity, (err,rows) => {
          if(err)
              res.send('Error while adding');
          else    
            res.send('Added successfully to the cart');
        });
      }else{
        let insertQuantity = `Insert into tbl_cart_master (cart_id, user_id , product_id , quantity_placed ,status , date) VALUES (${cart_id},${user_id},${productId},${quantity},1,NOW())`;
        req.db.query(insertQuantity, (err,rows) => {
          if(err)
              res.send('Error while adding');
          else    
            res.send('Added successfully to the cart');
        });
      }
    });

  }else{
    res.send('Sorry There is no such item present');
    // Item is no longer present with the same quantity as you wanted to place
  }


}



const shopNow=(req,res)=>{
// So i am assuming that the items will be always added first to cart and then going to get purchased
// with this flow we will get to handle rac e condition as well since we will check here again whether the quantity is still present in products table or not
let connection = req.db;
let productId = req.body.productId;
let user_id = req.body.userId;
let itemsMissed = [];
let order_id= Math.floor(new Date().valueOf() * Math.random()); 
let selectItem = `select * from tbl_cart_master where user_id = ${user_id} and status =1`;
req.db.query(selectItem, (err,rows) => {
  if(err)
      res.send('Error while adding');
  else{    
  async.eachSeries(rows, async (item, callback)=> {
    if (inCache(item)) {
        callback(null, cache[item]); // if many items are cached, you'll overflow
    } else {
       // doSomeIO(item, callback);
        // check for every cart whether the item is there in the inventory or not
       let checkItems =  await checkItemPresent(item.product_id , item.quantity_placed,connection);
       if(checkItems){
            let placeOrder= `insert into tbl_order_master ( order_id , cart_id , user_id , date ) values (${order_id},${item.cart_id}, ${user_id},NOW())`;
            req.db.query(placeOrder, (err,rows) => {
              let changeStatus = `UPDATE tbl_cart_master SET status = 2 where cart_id = ${item.cart_id}`;
              let updateCount = `UPDATE products SET quantity = quantity- ${item.quantity_placed,connection} where cart_id = ${item.cart_id}`;
             // reduce the count 
              
              req.db.query(changeStatus, (err,rows) => {
               
                req.db.query(updateCount, (err,rows) => {
                  callback();
                });
              });
            
            });
           
           
       }else{
        itemsMissed.push(item);
       }
    }
}, function done() {
    //...
    if(itemsMissed.length ==0){
      res.send('All items in the cart have been plcaed successfull');
    }else{
      res.send('Items missed to placed are',JSON.stringify(itemsMissed));
    }
});
}
});


}

const removeItemFromCart = (req,res) =>{

  let cart_id = req.body.cart_id;
  if(cart_id){
    let deletCrt = `delete from tbl_cart_master where cart_id = ${cart_id}`;
    req.db.query(deletCrt, (err,rows) => {
      res.send('Succesfully deleted the item from cart');
    });
  }
}

module.exports={createOrder,addToCart,shopNow,removeItemFromCart}


