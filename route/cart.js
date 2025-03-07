const express = require('express');

const {create, readall, readId, update, deleteId, getUserCart, deleteUserCart, getCartCount} = require('../controller/cart')
// import verifyToken from '../middleware/verifyToken';
// import { verifyToken, requireAdmin } from '../middleware/authMiddleware'; 
const multer = require('multer');


const router = express.Router();

// set up multer storage for file uploads
const storage = multer.memoryStorage();
const upload = multer({storage});



router.post(
	'/create',
    // verifyToken,
    upload.single('imageUrl'),
    create
);

router.get(
    '/',
    readall
);
router.get(
	'/:id',
    // verifyToken,
    readId
);
router.get(
	'/user/:userId',
    // verifyToken,
    getUserCart
);
router.get(
	'/count/:userId',
    // verifyToken,
    getCartCount
);
router.put(
    '/:id',
    // verifyToken,
    update
);
router.delete(
    '/:id',
    // verifyToken,
    deleteId
);
router.delete(
    '/user/:userId',
    // verifyToken,
    deleteUserCart
);


module.exports = router;