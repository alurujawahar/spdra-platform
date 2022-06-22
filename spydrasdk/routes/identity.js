const express = require("express");
const router = express.Router();

const {registerEnrollUser, login} = require('../src/handlers/userController');

router.post('/', registerEnrollUser);
router.post('/login', login);

module.exports = router;