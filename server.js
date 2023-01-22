if (process.env.NODE_ENV !== 'production') require('dotenv').config();

const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.set('views', `${__dirname}/views`);
app.set('layout', 'layouts/layout');

app.use(express.static('public'));

const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
app.use(expressLayouts);
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }));

const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;
db.on('error', err => console.error(err));
db.once('open', () => console.log('Connected to Mongoose.'));

const indexRouter = require('./routes/index');
const authorsRouter = require('./routes/authors');
const booksRouter = require('./routes/books');
app.use('/', indexRouter);
app.use('/authors', authorsRouter);
app.use('/books', booksRouter);

app.listen(process.env.PORT || 3006);
