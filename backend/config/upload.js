const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, 'uploads/productos');

    },

    filename: (req, file, cb) => {

        const nombre = Date.now() + path.extname(file.originalname);

        cb(null, nombre);

    }

});

const upload = multer({
    storage
});

module.exports = upload;