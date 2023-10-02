const express = require('express');
const bc3reader = require('./routes/bc3readerRoute');
const multer = require('multer');
const cors = require('cors');

const app = express();

const uploadDir = './uploads'

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage: storage })

app.use(express.static(uploadDir))
app.use(express.json())

app.use(cors())

app.post('/api/v1/upload', upload.single('file'), (req, res) => {
    res.send('Archivo subido correctamente')
})

app.use('/api/v1/bc3reader', bc3reader)

app.listen(5000, function () {
    console.log('Server is running on port 5000');
})
