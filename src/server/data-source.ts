import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entities/entities.js"
import { config } from "dotenv"

config()

const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, POSTGRES_HOST, POSTGRES_PORT } = process.env;

if (!POSTGRES_USER || !POSTGRES_PASSWORD || !POSTGRES_DB || POSTGRES_HOST || POSTGRES_PORT) {
    throw new Error("Missing required environment variables: POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, POSTGRES_HOST, POSTGRES_PORT");
}

export const AppDataSource = new DataSource({
    type: "postgres",
    host: POSTGRES_HOST,
    port: parseInt(POSTGRES_PORT!),
    username: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: POSTGRES_DB,
    synchronize: true,
    logging: false,
    entities: [User],
    migrations: [],
    subscribers: [],
})
