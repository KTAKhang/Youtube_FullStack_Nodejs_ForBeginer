const express = require('express');
const mongooese = require('mongoose');
const dotenv = require("dotenv");
dotenv.config();
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT;
///////////////////////////////////////////////


//////////////////////////////////////////////////
mongooese.connect(process.env.MONGO_URL);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});














// const express = require('express');
// const app = express();
// const port = 3000;

// // Middleware to parse JSON bodies
// app.use(express.json());

// // Sample data
// let books = [
//     { id: 1, title: "1984", author: "George Orwell" },
//     { id: 2, title: "To Kill a Mockingbird", author: "Harper Lee" }
// ];

// // Routes

// // GET all books
// app.get('/books', (req, res) => {
//     res.json(books);
// });

// // GET a single book by ID
// app.get('/books/:id', (req, res) => {
//     const book = books.find(b => b.id === parseInt(req.params.id));
//     if (!book) return res.status(404).send('Book not found');
//     res.json(book);
// });

// // POST a new book
// app.post('/books', (req, res) => {
//     const book = {
//         id: books.length + 1,
//         title: req.body.title,
//         author: req.body.author
//     };
//     books.push(book);
//     res.status(201).json(book);
// });

// // PUT update a book
// app.put('/books/:id', (req, res) => {
//     const book = books.find(b => b.id === parseInt(req.params.id));
//     if (!book) return res.status(404).send('Book not found');

//     book.title = req.body.title;
//     book.author = req.body.author;
//     res.json(book);
// });

// // DELETE a book
// app.delete('/books/:id', (req, res) => {
//     books = books.filter(b => b.id !== parseInt(req.params.id));
//     res.status(204).send();
// });

// // Start server
// app.listen(port, () => {
//     console.log(`Server is running on http://localhost:${port}`);
// });
