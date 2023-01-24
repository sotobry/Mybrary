const express = require('express');
const router = express.Router();

const Author = require('../models/Author');
const Book = require('../models/Book');
router
  .route('/')
  // Get all authors route
  .get(async (req, res) => {
    const { query } = req;
    const { name } = query;

    let searchOptions = {};
    if (name != null && name !== '') searchOptions.name = new RegExp(name, 'i');

    try {
      const authors = await Author.find(searchOptions);
      res.render('authors/index', { authors, name });
    } catch (err) {
      // res.render('authors/index', {
      //   authors: [],
      //   errorMessage: 'Error getting the authors.',
      // });
      res.redirect('/');
    }
  })
  //Create new author route
  .post(async (req, res) => {
    const { name } = req.body;
    const author = new Author({ name });
    try {
      const newAuthor = await author.save();
      res.redirect('authors');
    } catch (err) {
      console.error(err);
      res.render('authors/new', {
        author,
        errorMessage: 'Error creating Author.',
      });
    }
  });

router
  .route('/new')
  // Get new author form route
  .get((req, res) => {
    const author = new Author();
    res.render('authors/new', { author });
  });

router
  .route('/:id')
  .get(async (req, res) => {
    const { id } = req.params;
    try {
      const author = await Author.findById(id);
      const booksByAuthor = await Book.find({ authorId: author.id }).limit(6);

      res.render(`authors/show`, { author, booksByAuthor });
    } catch (err) {
      // console.error(err);
      res.redirect('/');
    }
  })
  .put(async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    let author;
    try {
      author = await Author.findById(id);
      author.name = name;
      await author.save();
      res.redirect(`/authors/${id}`);
    } catch (err) {
      // console.error(err);

      // if we couldn't find an author
      if (author == null) {
        console.log("Couldn't find the author");
        res.redirect('/');
      } else {
        res.render(`authors/edit`, {
          author,
          errorMessage: 'Error updating Author.',
        });
      }
    }
  })
  .delete(async (req, res) => {
    const { id } = req.params;

    let author;

    try {
      author = await Author.findById(id);
      await author.remove();

      res.redirect(`/authors`);
    } catch {
      // console.error(err);
      // if we couldn't find an author
      if (author == null) {
        res.redirect(`/`);
      } else {
        res.redirect(`/authors/${author.id}`);
      }
    }
  });

router.route('/:id/edit').get(async (req, res) => {
  const { id } = req.params;
  try {
    const author = await Author.findById(id);
    res.render(`authors/edit`, { author });
  } catch (err) {
    console.error(err);
    res.redirect('/authors');
  }
});

module.exports = router;
