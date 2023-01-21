if (process.env.NODE_ENV !== 'production') require('dotenv').config();

const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.set('views', `${__dirname}/views`);
app.set('layout', 'layouts/layout');

app.use(express.static('public'));

const expressLayouts = require('express-ejs-layouts');
app.use(expressLayouts);

const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;
db.on('error', err => console.error(err));
db.once('open', () => console.log('Connected to Mongoose.'));

const indexRouter = require('./routes/index');
app.use('/', indexRouter);

app.listen(process.env.PORT);
