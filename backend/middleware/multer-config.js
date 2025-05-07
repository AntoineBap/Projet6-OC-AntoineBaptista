const multer = require('multer');
const sharp = require('sharp');
const { Readable } = require('stream');
const cloudinary = require('./cloudinary-config');

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error('Format d’image non supporté'), false);
    }
    cb(null, true);
  },
}).single('image');

const uploadToCloudinary = async (buffer) => {
  const resizedBuffer = await sharp(buffer)
    .resize(800)
    .webp({ quality: 80 })
    .toBuffer();

  const stream = cloudinary.uploader.upload_stream({
    folder: 'book_images', // optionnel : crée un dossier dans Cloudinary
    resource_type: 'image',
    format: 'webp'
  }, (error, result) => {
    if (error) throw error;
    return result;
  });

  const readable = new Readable();
  readable._read = () => {};
  readable.push(resizedBuffer);
  readable.push(null);
  readable.pipe(stream);

  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(stream));
    stream.on('error', reject);
  });
};

const processImage = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'book_images',
          format: 'webp',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      sharp(req.file.buffer)
        .resize(800)
        .webp({ quality: 80 })
        .toBuffer()
        .then((data) => {
          const readable = new Readable();
          readable._read = () => {};
          readable.push(data);
          readable.push(null);
          readable.pipe(stream);
        });
    });

    req.file.cloudinaryUrl = result.secure_url;
    next();
  } catch (error) {
    console.error('Erreur Cloudinary :', error);
    res.status(500).json({ message: 'Erreur lors du traitement de l’image' });
  }
};

module.exports = { upload, processImage };
