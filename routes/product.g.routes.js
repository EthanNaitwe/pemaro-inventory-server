const express = require('express');
const productController = require('../controllers/product.g.controller');
const variantController = require('../controllers/variant.g.controller');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, productController.addProductG);
router.get('/', authMiddleware, productController.fetchAllProductsG);
router.get('/categories', authMiddleware, productController.getCategories);
router.get('/art/:artNumber', authMiddleware, productController.getProductByArtNumberG);

// Stock
router.post('/:productId/stock', authMiddleware, productController.adjustStock);
router.get('/:productId/stock', authMiddleware, productController.getStockMovements);


// Variant Routes
router.post('/:productId/variants', authMiddleware, variantController.addVariant);
router.get('/variants', authMiddleware, variantController.getAllVariants);

module.exports = router;
