const express = require('express');
const auth = require('../config/auth');
const productController = require('../controllers/productController');

const router = express.Router();

router.use(auth);
router.route('/')
    .get(productController.findAll)
    .post(productController.create);
router.route('/:id')
    .get(productController.findById)
    .put(productController.update)
    .delete(productController.delete);

module.exports = router;
