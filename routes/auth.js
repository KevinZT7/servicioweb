const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User'); // Asegúrate de que la ruta es correcta

// Registro de usuarios
router.post('/register', [
    body('username').isLength({ min: 3 }).withMessage('El nombre de usuario debe tener al menos 3 caracteres.'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    // Verificar si el usuario ya existe en la base de datos
    const userExists = await User.findOne({ username });
    if (userExists) {
        return res.status(400).json({ message: 'Usuario ya registrado' });
    }

    // Encriptar la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear un nuevo usuario y guardarlo en la base de datos
    const user = new User({ username, password: hashedPassword });
    await user.save();

    res.json({ message: 'Registro exitoso' });
});

// Inicio de sesión
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Verificar si el usuario existe en la base de datos
    const user = await User.findOne({ username });
    if (!user) {
        return res.status(400).json({ message: 'Usuario no encontrado' });
    }

    // Comparar las contraseñas
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Contraseña incorrecta' });
    }

    // Generar un token JWT
    const token = jwt.sign({ id: user._id, username: user.username }, 'secreto', { expiresIn: '1h' });

    res.json({ message: 'Autenticación satisfactoria', token });
});

// Middleware de autenticación
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado. No se encontró un token.' });
    }

    try {
        const verified = jwt.verify(token, 'secreto'); 
        req.user = verified; 
        next(); // Llama al siguiente middleware
    } catch (err) {
        res.status(400).json({ message: 'Token no válido' });
    }
};

// Ruta protegida de ejemplo
router.get('/me', authMiddleware, async (req, res) => {
    const user = await User.findById(req.user.id).select('-password'); // Excluye la contraseña
    res.json(user);
});

module.exports = router;



