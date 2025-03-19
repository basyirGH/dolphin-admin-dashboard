import { format } from 'date-fns-tz';

// Math.random() gives decimal from 0 inclusive to 1 exclusive
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getCurrentDate = (timeZone = 'Asia/Kuala_Lumpur') => {
  return format(new Date(), "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone });
};

const generateOrder = (customerId, productId, orderDate, pricePerUnit) => {
  //console.log("+1 new order, date: " + orderDate)
  return {
    customerId: customerId,
    orderDate: orderDate,
    items: [
      { productId: productId, quantity: getRandomNumber(1, 3), pricePerUnit: pricePerUnit},
    ],
  }

};

export default generateOrder;
