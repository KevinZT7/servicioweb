const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth'); // Asegúrate de que la ruta es correcta

const app = express();

// Middleware para analizar el cuerpo de las solicitudes
app.use(express.json());

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/servicioweb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Conectado a MongoDB'))
.catch(err => console.error('No se pudo conectar a MongoDB', err));

// Rutas
app.use('/api', authRoutes);

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

