require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors({ origin: ['https://day-center-misgav.vercel.app', 'http://localhost:5173'] }));
app.use(express.json());

app.use('/api/seniors', require('./routes/seniors'));
app.use('/api/transport', require('./routes/transport'));
app.use('/api/absences', require('./routes/absences'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB מחובר');
    app.listen(process.env.PORT, () => console.log(`שרת פועל על פורט ${process.env.PORT}`));
  })
  .catch(err => console.error('שגיאת חיבור:', err));
