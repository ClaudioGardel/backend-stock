const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const app = express();

// ✅ Traer el JSON desde la variable de entorno y parsearlo
const raw = JSON.parse(process.env.FIREBASE_CONFIG_JSON);

// ✅ Corregir los saltos de línea en la private_key
raw.private_key = raw.private_key.replace(/\\n/g, '\n');

// ✅ Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(raw),
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

    const batch = db.batch();

    stockItems.forEach(item => {
      const docRef = db.collection('stock').doc(item.id?.toString() || db.collection('stock').doc().id);
      batch.set(docRef, item);
    });

    await batch.commit();

    res.status(200).json({ message: '✅ Stock sincronizado correctamente' });
  } catch (error) {
    console.error('❌ Error al sincronizar stock:', error);
    res.status(500).json({ error: 'Ocurrió un error al sincronizar el stock' });
  }
});

// Ruta para obtener stock
app.get('/api/stock', async (req, res) => {
  try {
    const snapshot = await db.collection('stock').get();
    const stock = snapshot.docs.map(doc => doc.data());
    res.json(stock);
  } catch (error) {
    console.error('❌ Error al obtener stock:', error);
    res.status(500).json({ error: 'Ocurrió un error al obtener el stock' });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Backend escuchando en http://localhost:${PORT}`);
});
