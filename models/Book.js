const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  publishedDate: {
    type: Date,
    required: true,
  },
  pageCount: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    immutable: true,
    required: true,
    default: Date.now,
  },
  coverImageName: {
    type: String,
    required: true,
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Author',
  },
});

const path = require('path');
const coverImageBasePath = 'uploads/bookCovers';

bookSchema.virtual('coverImagePath').get(function () {
  if (this.coverImageName != null) {
    return path.join('/', coverImageBasePath, this.coverImageName);
  }
});
const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
module.exports.coverImageBasePath = coverImageBasePath;
