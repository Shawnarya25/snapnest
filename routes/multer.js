const multer = require('multer')
const {v4: uuidv4} = require('uuid')// Generate unique filenames using UUID
//UUID stands for Universally Unique Identifier and its used to create unique names 
// for files to avoid naming conflicts.
const path = require('path');// Path module to handle file paths

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads/')
  },
  filename: function (req, file, cb) {
        const unique = uuidv4();
        cb(null, unique + path.extname(file.originalname)); // Append the file extension
    }
})

const upload = multer({ storage: storage })
module.exports = upload;