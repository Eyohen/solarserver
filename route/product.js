const express = require('express');

const {create, readall, readId, update, deleteId} = require('../controller/product')

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
router.put(
    '/:id',
    upload.single('imageUrl'),
    update
);
router.delete(
    '/:id',
    // verifyToken,
    deleteId
);


module.exports = router;