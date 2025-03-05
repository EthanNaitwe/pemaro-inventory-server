const express = require('express');
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, productController.createProduct);
router.get('/', authMiddleware, productController.getAllProducts);
router.get('/:id', authMiddleware, productController.getProductById);
router.put('/:id', authMiddleware, productController.updateProduct);
router.delete('/:id', authMiddleware, productController.deleteProduct);

// Product Variants
router.post('/:productId/variants', productController.addVariant);

module.exports = router;
