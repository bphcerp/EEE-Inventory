/**
 * @file repositories.ts
 * @description This file contains the repository exports for the User, Laboratory, and InventoryItem entities used in the EEE-Inventory system.
 */

import { AppDataSource } from "../data-source";
import { AccessToken, InventoryItem, Laboratory, User } from "../entities/entities";

export const userRepository = AppDataSource.getRepository(User);
export const labRepository = AppDataSource.getRepository(Laboratory);
export const itemRepository = AppDataSource.getRepository(InventoryItem);
export const tokenRepository = AppDataSource.getRepository(AccessToken);
