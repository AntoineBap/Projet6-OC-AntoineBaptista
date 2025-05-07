const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { upload, processImage } = require('../middleware/multer-config');
const bookCtrl = require('../controllers/book');

// Routes de consultation
router.get("/", bookCtrl.getAllBooks);
router.get("/bestrating", bookCtrl.bestRating);
router.get("/:id", bookCtrl.getOneBook);

// Création avec image (upload + traitement + Cloudinary)
router.post("/", auth, upload, processImage, bookCtrl.createBook);

// Modification sans image pour l’instant (on peut l’ajouter après)
router.put("/:id", auth, bookCtrl.modifyBook);

// Suppression et notation
router.delete("/:id", auth, bookCtrl.deleteBook);
router.post("/:id/rating", auth, bookCtrl.rateBook);

module.exports = router;
