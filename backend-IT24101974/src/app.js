import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import path from 'path';
import routes from './routes/index.js';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Manufacturing Mobile API is running', timestamp: new Date() });
});

app.use('/api', routes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/manufacturing_mobile')
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, HOST, () => {
      console.log(`🚀 Server running on http://${HOST}:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    console.error('Start MongoDB: docker run -d -p 27017:27017 mongo');
    process.exit(1);
  });
