const Book = require("../models/Book");
const fs = require('fs');
const axios = require('axios');

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(400).json({ error }));
};

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._userId;
  const book = new Book({
    ...bookObject, 
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
  })
  book.save()
    .then((savedBook) => { res.status(201).json({savedBook})})
    .catch(error => { res.status(400).json( { error })})
};

exports.modifyBook = (req, res, next) => {
  Book.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
  .then(() => res.status(200).json({ message: "Livre modifié !" }))
  .catch((error) => res.status(400).json({ error }));
}

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id})
    .then(book => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: 'Non-autorisé'})
      } else {
        const filename = book.imageUrl.split('/images')[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({_id: req.params.id})
            .then(() => res.status(200).json({message: 'Objet Supprimé !'}))
            .catch(error => res.status(400).json({ error }))
        });
      }
    })
    .catch( error => {res.status(500).json({ error });})
};

exports.rateBook = async (req, res, next) => {
  const bookId = req.params.id;
  const { userId, rating } = req.body;
  const book = await Book.findById(bookId);
  if (!book) {
      return res.status(404).json({ message: "Livre non trouvé" });
  }
  book.ratings.push({ userId, grade: rating });
  const totalGrades = book.ratings.reduce((acc, curr) => acc + curr.grade, 0);
  const averageRating = totalGrades / book.ratings.length;
  book.averageRating = averageRating;
  book.save()
    .then(res.status(200).json({ ...book._doc }))
    .catch(error => res.status(400).json({ error }))
};

exports.bestRating = async (req, res, next) => {
  try {
    const books = await Book.find();
    const sortedBooks = books.sort((a, b) => b.averageRating - a.averageRating);
    const topRatedBooks = sortedBooks.slice(0, 3);
    res.status(200).json(topRatedBooks);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};