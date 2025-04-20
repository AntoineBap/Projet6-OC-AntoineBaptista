const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const storage = multer.memoryStorage(); // stock image en mémoire temporairement

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // limite d'upload de 2 Mo
  fileFilter: (req, file, callback) => { // verifie le mimetype
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return callback(new Error('Format d’image non supporté'), false);
    }
    callback(null, true);
  },
}).single('image'); // un seul fichier attendu

const processImage = async (req, res, next) => {
  if (!req.file) { // verifie qu'un fichier a bien été upload
    return next();
  }

  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`; // change le nom de la file
  const outputPath = path.join('images', filename); // cree le chemin ou l'image est stockee

  try {
    await sharp(req.file.buffer)
      .resize(800) // redimensionne a 800px de width
      .toFormat('webp', { quality: 80 }) // convertit en webp 
      .toFile(outputPath); // save le fichier optimise dans images

    req.file.filename = filename; // met a jour le nom du fichier
    req.file.path = outputPath; 
    next();
  } catch (error) {
    console.error('Erreur lors de la conversion de l’image :', error);
    res.status(500).json({ message: 'Erreur lors du traitement de l’image' });
  }
};

module.exports = { upload, processImage };
