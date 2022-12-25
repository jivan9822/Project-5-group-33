// MAKE CART EMPTY
exports.emptyCart = (query) => {
  query.items = [];
  query.totalItems = 0;
  query.totalPrice = 0;
  query.totalQuantity = 0;
  return query.save();
};

// UPDATE CART BY REMOVING ITEM ONE OR DELETE ITEM FROM ARRAY
exports.updateCart = (key, query, ind) => {
  if (key === 0 || query.items[ind].quantity === 1) {
    if (key === 0) {
      query.totalPrice -= query.items[ind].price * query.items[ind].quantity;
      query.totalQuantity -= query.items[ind].quantity;
    } else {
      query.totalPrice -= query.items[ind].price;
      query.totalQuantity--;
    }
    query.items.splice(ind, 1);
    query.totalItems = query.items.length;
  } else {
    query.items[ind].quantity--;
    query.totalPrice -= query.items[ind].price;
    query.totalQuantity--;
    // query.totalItems = query.items.length;
  }
  return query;
};

// ADD TO CART
exports.addToCart = (query, ind, items, price) => {
  if (ind > -1) {
    query.items[ind].quantity++;
  } else {
    query.items.push(items);
    query.totalItems++;
  }
  query.totalPrice += price;
  query.totalQuantity++;
  return query;
};
