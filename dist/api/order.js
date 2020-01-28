'use strict';

var createOrder = function createOrder(req, res) {

  req.db.query('SELECT * FROM authors', function (err, rows) {
    if (err) throw err;

    console.log('Data received from Db:');
    console.log(rows);
  });
  res.send('hii');
};
module.exports = { createOrder: createOrder };
//# sourceMappingURL=order.js.map