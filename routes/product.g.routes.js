const express = require('express');
const productController = require('../controllers/product.g.controller');
const variantController = require('../controllers/variant.g.controller');
// const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', productController.addProductG);
router.get('/', productController.fetchAllProductsG);
router.get('/art/:artNumber', productController.getProductByArtNumberG);


// Variant Routes
router.post('/:productId/variants', variantController.addVariant);
router.get('/variants', variantController.getAllVariants);

module.exports = router;
