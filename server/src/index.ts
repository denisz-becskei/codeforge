import express from 'express';
import { DataSource } from 'typeorm';
import { Conversation } from './models/Conversation';
import { Message } from './models/Message';
import chatRoutes from './routes/chat.routes';
import dbService from './services/db.service';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

const AppDataSource = new DataSource({
  type: "sqlite",
  database: "/data/database.sqlite",
  entities: [Conversation, Message],
  synchronize: true,
});

AppDataSource.initialize()
  .then(() => {
    console.log('Database connected');
    
    app.use(express.json());
    app.set('trust proxy', true);  
    app.use('/api/chat', chatRoutes);

    dbService.setRepos(AppDataSource.getRepository(Conversation), AppDataSource.getRepository(Message));

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch(error => console.log('TypeORM connection error:', error));