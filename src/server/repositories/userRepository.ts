import { AppDataSource } from "../data-source.js";
import { User } from "../entities/entities.js";

export const userRepository = AppDataSource.getRepository(User);