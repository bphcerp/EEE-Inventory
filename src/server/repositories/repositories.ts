import { AppDataSource } from "../data-source.js";
import { InventoryItem, Laboratory, User } from "../entities/entities.js";

export const userRepository = AppDataSource.getRepository(User);
export const labRepository = AppDataSource.getRepository(Laboratory);
export const itemRepository = AppDataSource.getRepository(InventoryItem);
