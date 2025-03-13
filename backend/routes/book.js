const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { upload, processImage } = require('../middleware/multer-config');
const bookCtrl = require('../controllers/book');

router.get("/", bookCtrl.getAllBooks);
router.get("/bestrating", bookCtrl.bestRating);
router.get("/:id", bookCtrl.getOneBook);
router.post("/", auth, upload, processImage, bookCtrl.createBook);
router.put("/:id", auth, bookCtrl.modifyBook);
router.delete("/:id", auth, bookCtrl.deleteBook);
router.post("/:id/rating", auth, bookCtrl.rateBook);

module.exports = router;
