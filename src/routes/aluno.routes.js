const express = require('express');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');
const { createStudent } = require('../controllers/aluno.controller');

const router = express.Router();

router.post('/', authenticate, authorizeRoles('admin'), createStudent);
// outras rotas: GET /:id, GET /:id/qrcode etc.

module.exports = router;
