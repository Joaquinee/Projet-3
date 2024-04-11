const express = require('express');
const router = express.Router();

const categoriesCtrl = require('../controllers/categories.controller');
const auth = require('../middlewares/auth');
const multerConfig = require('../middlewares/multer-config');


router.post('/', auth, multerConfig , categoriesCtrl.create);
router.get('/', categoriesCtrl.findAll);



module.exports = router;
