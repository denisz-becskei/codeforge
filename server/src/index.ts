import express from 'express';
import { createConnection } from 'typeorm';
import chatRoutes from './routes/chat.routes';

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

createConnection().then(() => {
  console.log('Database connected');
  
  app.set('trust proxy', true);  
  app.use('/chat', chatRoutes);

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}).catch(error => console.log('TypeORM connection error:', error));