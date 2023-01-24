const mongoose = require('mongoose');
const Book = require('./Book');

const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

authorSchema.pre('remove', function (next) {
  Book.find({ authorId: this.id }, (err, books) => {
    if (err) next(err);
    else if (books.length > 0)
      next(
        new Error(
          `There are still books in the database authored by ${this.name}.`
        )
      );
    else next();
  });
});

const Author = mongoose.model('Author', authorSchema);

module.exports = Author;
