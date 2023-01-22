const Author = require('../models/Author');
const Book = require('../models/Book');

const path = require('path');
const multer = require('multer');

const uploadPath = path.join('public', Book.coverImageBasePath);
const upload = multer({
  dest: uploadPath,
  fileFilter: (req, file, callback) => {
    const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
    callback(null, imageMimeTypes.includes(file.mimetype));
  },
});

const renderNewPage = async (res, book, hasError = false) => {
  try {
    const authors = await Author.find();
    // console.log({ authors });
    const params = { book, authors };
    if (hasError) params.errorMessage = 'Error creating Book.';
    res.render('books/new', params);
  } catch (err) {
    res.redirect('/books');
  }
};

const express = require('express');
const router = express.Router();

const fs = require('fs');
const removeBookCover = filename => {
  fs.unlink(path.join(uploadPath, filename), err => {
    console.error(err);
  });
};

router
  .route('/')
  // Get all books route
  .get(async (req, res) => {
    const { query } = req;
    const { title, publishedBefore, publishedAfter } = query;

    let booksQuery = Book.find();
    if (title != null && title !== '')
      booksQuery = booksQuery.regex('title', new RegExp(title, 'i'));
    if (publishedBefore != null && publishedBefore !== '')
      booksQuery = booksQuery.lte('publishedDate', publishedBefore);
    if (publishedAfter != null && publishedAfter !== '')
      booksQuery = booksQuery.gte('publishedDate', publishedAfter);

    try {
      const books = await booksQuery.exec();
      res.render('books/index', {
        books,
        query: { title, publishedBefore, publishedAfter },
      });
    } catch (err) {
      console.error(err);
      res.redirect('/');
    }
  })
  //Create new book route
  .post(upload.single('cover'), async (req, res) => {
    const { file, body } = req;
    const { title, description, publishedDate, pageCount, authorId } = body;

    const coverImageName = file != null ? file.filename : null;
    const book = new Book({
      title,
      description,
      publishedDate: new Date(publishedDate),
      pageCount,
      coverImageName,
      authorId,
    });

    try {
      const newBook = await book.save();
      res.redirect('books');
    } catch (err) {
      if (book.coverImageName != null) removeBookCover(book.coverImageName);
      renderNewPage(res, book, true);
    }
  });

router
  .route('/new')
  // Get new book form route
  .get((req, res) => {
    const book = new Book();
    renderNewPage(res, book);
  });

module.exports = router;
