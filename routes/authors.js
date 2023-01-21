const express = require('express');
const router = express.Router();

const Author = require('../models/Author');
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

module.exports = router;
