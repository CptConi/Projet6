const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

const stuffCtrl = require("../controllers/sauces");

// Les routes fonction des requêtes à l'API:

module.exports = router;