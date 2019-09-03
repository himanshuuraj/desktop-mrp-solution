import { ref, db } from '../config/constants'



export function getOrders (user) {
  return ref.child(`users/${user.uid}/info`)
    .set({
      email: user.email,
      uid: user.uid
    })
    .then(() => user)
}

export function getPrice(areaId) {
  return db.ref("priceList/" + areaId).once("value");
}

export function getProduct(){
  return ref.child('products');
}

export function getShops(){
  let mobileNumber = window.sessionStorage.mobile;
  console.log(mobileNumber);
  return db.ref("users/" + mobileNumber + "/shops").once("value");
}

export function getOrder(orderId) {
  const refPath = `orders/${orderId}`;

}
