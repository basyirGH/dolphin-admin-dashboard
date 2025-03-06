const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getCurrentDate = () => new Date().toISOString();

const generateOrder = () => {
  const currentDate  =getCurrentDate();
  //console.log("+1 new order, date: " + currentDate)
  return {
    customerId: getRandomNumber(1, 9),
    orderDate: currentDate,
    items: [
      { productId: 1, quantity: getRandomNumber(1, 10), pricePerUnit: 0.98 },
      { productId: 2, quantity: getRandomNumber(1, 10), pricePerUnit: 1.29 },
      { productId: 3, quantity: getRandomNumber(1, 10), pricePerUnit: 0.54 },
    ],
  };
};

export default generateOrder;
