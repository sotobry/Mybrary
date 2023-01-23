const Author = require('../models/Author');
const Book = require('../models/Book');

const renderNewPage = async (res, book, hasError = false) => {
  try {
    const authors = await Author.find();
    // console.log({ authors });
    const params = { book, authors };
    if (hasError) {
      params.errorMessage = 'Error creating Book.';
    }
    res.render('books/new', params);
  } catch (err) {
    res.redirect('/books');
  }
};

const express = require('express');
const router = express.Router();

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
  .post(async (req, res) => {
    const { title, description, publishedDate, pageCount, authorId, cover } =
      req.body;

    const book = new Book({
      title,
      description,
      publishedDate: new Date(publishedDate),
      pageCount,
      authorId,
    });

    const saveCover = (book, encodedCover) => {
      if (encodedCover == null) return;
      const cover = JSON.parse(encodedCover);
      const imageMimeTypes = ['jpeg', 'png', 'gif'].map(
        type => `image/${type}`
      );
      if (cover != null && imageMimeTypes.includes(cover.type));
      {
        book.coverImage = new Buffer.from(cover.data, 'base64');
        book.coverImageType = cover.type;
      }
    };
    saveCover(book, cover);
    try {
      const newBook = await book.save();
      res.redirect('books');
    } catch (err) {
      console.error(err);
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
