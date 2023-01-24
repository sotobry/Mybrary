const Author = require('../models/Author');
const Book = require('../models/Book');

const renderFormPage = async (
  res,
  book,
  renderUrl,
  hasError = false,
  errMsg
) => {
  try {
    const authors = await Author.find();
    const params = { book, authors };
    if (hasError) {
      params.errorMessage = errMsg;
    }
    res.render(renderUrl, params);
  } catch (err) {
    res.redirect('/books');
  }
};

const renderNewPage = async (res, book, hasError = false) => {
  const renderUrl = 'books/new';
  const errMsg = 'Error creating Book.';
  await renderFormPage(res, book, renderUrl, hasError, errMsg);
};
const renderEditPage = async (res, book, hasError = false) => {
  const renderUrl = 'books/edit';
  const errMsg = 'Error updating Book.';
  await renderFormPage(res, book, renderUrl, hasError, errMsg);
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
      res.redirect(`books/${newBook.id}`);
    } catch (err) {
      console.error(err);
      await renderNewPage(res, book, true);
    }
  });

router
  .route('/new')
  // Get new book form route
  .get(async (req, res) => {
    const book = new Book();
    await renderNewPage(res, book);
  });

router
  .route('/:id')
  .get(async (req, res) => {
    const { id } = req.params;
    try {
      const book = await Book.findById(id);
      const author = await Author.findById(book.authorId);
      res.render(`books/show`, { book, author });
    } catch (err) {
      console.error(err);
      res.redirect('/');
    }
  })
  .put(async (req, res) => {
    const { id } = req.params;
    const { title, authorId, publishedDate, pageCount, description, cover } =
      req.body;

    let book;
    try {
      book = await Book.findById(id);

      book.title = title;
      book.authorId = authorId;
      book.publishedDate = new Date(publishedDate);
      book.pageCount = pageCount;
      book.description = description;

      if (cover != null && cover !== '') saveCover(book, cover);
      await book.save();
      res.redirect(`/books/${book.id}`);
    } catch (err) {
      console.error(err);

      // if we couldn't find the book
      if (book == null) {
        console.log("Couldn't find the book");
        res.redirect('/');
      } else {
        await renderEditPage(res, book, true);
      }
    }
  })
  .delete(async (req, res) => {
    const { id } = req.params;

    let book;

    try {
      book = await Book.findById(id);
      await book.remove();

      res.redirect(`/books`);
    } catch {
      // if we couldn't find the book
      if (book == null) {
        res.redirect(`/`);
      } else {
        res.render('books/show', {
          book,
          errorMessage: 'Error: could not remove Book.',
        });
      }
    }
  });

router.route('/:id/edit').get(async (req, res) => {
  const { id } = req.params;
  try {
    const book = await Book.findById(id);
    await renderEditPage(res, book);
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

module.exports = router;
