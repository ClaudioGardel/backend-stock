const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const app = express();

// 👇 Carga del archivo de credenciales descargado desde Firebase
const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG_JSON);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});


const db = admin.firestore();

app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('🚀 Backend funcionando correctamente');
});

// Ruta para sincronizar stock
app.post('/api/sync-stock', async (req, res) => {
  try {
    const stockItems = req.body;

    console.log('📥 Stock recibido:', stockItems); // 👈 MOSTRAR LO QUE LLEGA

    const batch = db.batch();

    stockItems.forEach(item => {
      const docRef = db.collection('stock').doc(item.id?.toString() || db.collection('stock').doc().id);
      batch.set(docRef, item);
    });

    await batch.commit();

    res.status(200).json({ message: '✅ Stock sincronizado correctamente' });
  } catch (error) {
    console.error('❌ Error al sincronizar stock:', error); // 👈 IMPRIME ERROR COMPLETO
    res.status(500).json({ error: 'Ocurrió un error al sincronizar el stock' });
  }
});


// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Backend escuchando en http://localhost:${PORT}`);
});
