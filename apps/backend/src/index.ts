import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import authRouter from './routes/api/auth';
import syncRouter from './routes/api/sync';
import prisma from './lib/prisma';
import { errorHandlingMiddleware, notFoundMiddleware } from './middlewares/errorHandlingMiddleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(helmet());
app.use(compression({ threshold: 0 }));
app.use(express.json());
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/sync', syncRouter);

app.get('/', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      message: 'Mobile Backend is running!',
      service: 'Node.js + Express',
      db_status: 'Connected',
      db_type: 'PostgreSQL + PostGIS'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Backend running but DB connection failed',
      error: error
    });
  }
});

app.use(notFoundMiddleware);
app.use(errorHandlingMiddleware);

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
  }
});
