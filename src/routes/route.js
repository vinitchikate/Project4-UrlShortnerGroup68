const express = require('express');
const router = express.Router();
const urlController = require('../controller/urlController');


router.post("/url/shorten", urlController.urlShorten);
router.get("/:urlCode",urlController.urlCode);


module.exports = router;