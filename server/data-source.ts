import "reflect-metadata"
import { DataSource } from "typeorm"
import { InventoryItem, Laboratory, User } from "./entities/entities"
import { config } from "dotenv";
import path from "path";

config({
  path: path.join(__dirname, process.env.NODE_ENV === 'development' ? '.env.development' : '.env.production')
})

const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, POSTGRES_HOST, POSTGRES_PORT } = process.env;

if (!POSTGRES_USER || !POSTGRES_PASSWORD || !POSTGRES_DB || !POSTGRES_HOST || !POSTGRES_PORT) {
    throw new Error("Missing required environment variables: POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, POSTGRES_HOST, POSTGRES_PORT");
}

export const AppDataSource = new DataSource({
    type: "postgres",
    host: POSTGRES_HOST,
    port: parseInt(POSTGRES_PORT!),
    username: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: POSTGRES_DB,
    synchronize: true, // Change in production
    logging: true,
    entities: [User, Laboratory, InventoryItem],
    migrations: [],
    subscribers: [],
})

AppDataSource.initialize()
    .then(() => {
        console.log(`Connected to POSTGRES User: ${POSTGRES_USER} DB: ${POSTGRES_DB} PORT: ${POSTGRES_PORT}`)
    })
    .catch((err) => {
        console.error("Error during Data Source initialization:", err)
    })