const express = require('express');
const authorization = require('../middleware/authorization');
const productController = require('../controllers/productController');

const router = express.Router();

router.use(authorization);
router.route('/')
    .get(productController.findAll)
    .post(productController.create);
router.route('/:id')
    .get(productController.findById)
    .put(productController.update)
    .delete(productController.delete);

module.exports = router;
