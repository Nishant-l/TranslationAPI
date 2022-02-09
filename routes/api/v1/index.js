const express = require('express');
const router = express.Router();
const translateController = require('../../../controller/api/v1/translatorController');

router.get('/',translateController.translate);
module.exports = router;