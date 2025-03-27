/**
 * @file userController.ts
 * @description This file contains the controllers for managing user-related operations. 
*/

import { Request, Response } from 'express';
import { labRepository, userRepository } from '../repositories/repositories';
import { AppDataSource } from '../data-source';
import { User } from '../entities/entities';

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
    // To get all the admins or technicians
    const { role } = req.query
    try {
        const users = await userRepository.find({
            ...( role ? { where : { role : (role as 'Admin' | 'Technician' | 'Faculty') } } : {} ),
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
        const labs = await labRepository.findBy(req.user?.role === 'Technician' ? { technicianInCharge: req.user! } : req.user?.role === 'Faculty' ? { facultyInCharge : req.user! } : {});

        res.status(200).json(labs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching laboratories', error });
        console.error(error);
    }
};

// Add User Controller
export const addUser = async (req: Request, res: Response) => {
    const { name, email, permissions, role } = req.body;

    try {
        const user = new User();
        user.email = email;
        user.name = name;
        user.permissions = permissions;
        user.role = role;

        await userRepository.save(user);

        res.status(201).json({ message: 'User added successfully' });
    } catch (error) {
        res.status(500).json({ message: (error as any)?.code === '23505' ? 'User already exists' : 'Error adding user', error });
        console.error(error);
    }
};

// Modify User Controller
export const modifyUser = async (req: Request, res: Response) => {
    const newUserData: Partial<User> = req.body;
    const { id }  = req.params

    try {
        const user = await userRepository.findOneBy({ id });

        if (!user) {
            res.status(404).json({ message: 'User not found!' });
            return
        }

        await userRepository.save(newUserData);

        res.status(200).json({ message: 'User modified successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error modifying user', error });
        console.error(error);
    }
};

// Delete User Controller
export const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const user = await userRepository.findOneBy({ id });

        if (!user) {
            res.status(404).json({ message: 'User not found!' });
            return;
        }

        await userRepository.remove(user);

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: (error as any)?.code === '23503' ? ' Cannot delete, this user is referenced in a laboratory' : 'Error deleting user', error });
        console.error(error);
    }
};
