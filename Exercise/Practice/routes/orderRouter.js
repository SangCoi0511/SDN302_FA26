const express = require('express');
const authorization = require('../middleware/authorization');
const orderController = require('../controllers/orderController');

const router = express.Router();

router.use(authorization);
router.route('/')
    .get(orderController.findAll)
    .post(orderController.create);
router.route('/:id')
    .get(orderController.findById)
    .put(orderController.update)
    .delete(orderController.delete);

module.exports = router;
