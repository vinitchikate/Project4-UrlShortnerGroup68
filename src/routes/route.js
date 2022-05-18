const express = require('express');
const router = express.Router();
const valid = require('../middleware/valid');
const urlController = require('../controller/urlController');


router.post("/url/shorten", valid.urlShorten, urlController.urlShorten);
router.get("/:urlCode", valid.urlCode, urlController.urlCode);


module.exports = router;