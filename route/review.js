const express = require('express');
const {create,readId, readall, update, deleteId} = require('../controller/review');


const router = express.Router();

router.post(
    '/:productId',
    create
);


router.get(
    '/',
    readall
);

router.get(
    '/:id',
    // authMiddleware,
    // verifyToken, requireAdmin,
    readId
);

router.put(
    '/:id',
    update
);

router.delete(
    '/:id',
    deleteId
);

module.exports = router;