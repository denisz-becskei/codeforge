import { DataSource } from "typeorm";
import { Conversation } from "../models/Conversation";
import { Message } from "../models/Message";

const AppDataSource = new DataSource({
  type: "sqlite",
  database: "/data/database.sqlite",
  entities: [Conversation, Message],
  synchronize: true,
  migrations: [],
  subscribers: [],
});

export default AppDataSource;
