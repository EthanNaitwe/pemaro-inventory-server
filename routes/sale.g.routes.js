const express = require('express');
const router = express.Router();
const saleController = require('../controllers/sale.g.controller');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', saleController.getAllSales);
// router.get('/:reference', saleController.getSaleByReference);
router.post('/:prodId/product', saleController.addSale);
// router.put('/:reference', saleController.updateSale);
// router.delete('/:reference', saleController.deleteSale);

module.exports = router;
