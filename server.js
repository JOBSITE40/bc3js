const express = require('express');
const bc3reader = require('./routes/bc3readerRoute');
const multer = require('multer');
const cors = require('cors');

const app = express();

// const uploadDir = './uploads'

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, uploadDir)
//     },
//     filename: function (req, file, cb) {
//         cb(null, file.originalname)
//     }
// })

// const upload = multer({ storage: storage })

// app.use(express.static(uploadDir))
// app.use(express.json())

// 1) MIDDLEWARES
// app.use(express.static('./uploads'));
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "200mb" }));
app.use(cors());



app.use('/api/v1/bc3reader', bc3reader)

app.listen(5000, function () {
    console.log('Server is running on port 5000');
})
