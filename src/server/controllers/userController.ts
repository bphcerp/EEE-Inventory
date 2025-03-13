/**
 * @file userController.ts
 * @description This file contains the controllers for managing user-related operations. 
*/

import { Request, Response } from 'express';
import { userRepository } from '../repositories/repositories.js';
import { AppDataSource } from '../data-source.js';
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import { User } from '../entities/entities.js';
import { AnyError, In } from 'typeorm';

config();

const JWT_SECRET = process.env.JWT_SECRET!;

/*
 * Transactions are used in this file. This helps in:
 * - Ensuring that all operations within a transaction are completed successfully before committing the changes to the database.
 * - Rolling back any changes if an error occurs during the transaction, preventing partial updates and maintaining data consistency.
*/

// Get User Permissions Controller
export const getUserPermissions = async (req: Request, res: Response) => {
    try {
        res.status(200).json({ permissions: req.user!.permissions });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user permissions', error });
        console.error(error);
    }
};

// Get All Users Controller
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await userRepository.find({
            relations: ['laboratories']
        });

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user permissions', error });
        console.error(error);
    }
};

// Get User Labs Controller
// This controller assumes you have passed the auth middleware before this
// The user object is available in the request object after the middleware is executed
export const getUserLabs = async (req: Request, res: Response) => {
    try {
        const user = await userRepository.findOne({
            where: { id: req.user!.id },
            relations: ['laboratories']
        });

        res.status(200).json(user!.laboratories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching laboratories', error });
        console.error(error);
    }
};

// Add User Controller
export const addUser = async (req: Request, res: Response) => {
    const { email, permissions, labIds } = req.body;

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const user = new User();
        user.email = email;
        user.permissions = permissions;
        user.laboratories = (labIds as string[]).map((id) => ({ id })) as any
        await queryRunner.manager.save(user);

        await queryRunner.commitTransaction();
        res.status(201).json({ message: 'User added successfully' });
    } catch (error) {
        await queryRunner.rollbackTransaction();
        res.status(500).json({ message: (error as any)?.code === '23505' ? 'User already exists' : 'Error adding user', error });
        console.error(error);
    } finally {
        await queryRunner.release();
    }
};

// Modify User Controller
export const modifyUser = async (req: Request, res: Response) => {
    const { id, email, permissions } = req.body;

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const user = await queryRunner.manager.findOneBy(User, { id });

        if (!user) {
            await queryRunner.rollbackTransaction();
            res.status(404).json({ message: 'User not found!' });
            return
        }

        user.email = email;
        user.permissions = permissions;
        await queryRunner.manager.save(user);

        await queryRunner.commitTransaction();
        res.status(200).json({ message: 'User modified successfully' });
    } catch (error) {
        await queryRunner.rollbackTransaction();
        res.status(500).json({ message: 'Error modifying user', error });
        console.error(error);
    } finally {
        await queryRunner.release();
    }
};

// Delete User Controller
export const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.body;

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const user = await queryRunner.manager.findOneBy(User, { id });

        if (!user) {
            await queryRunner.rollbackTransaction();
            res.status(404).json({ message: 'User not found!' });
            return
        }

        await queryRunner.manager.remove(user);

        await queryRunner.commitTransaction();
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        await queryRunner.rollbackTransaction();
        res.status(500).json({ message: 'Error deleting user', error });
        console.error(error);
    } finally {
        await queryRunner.release();
    }
};
