import React, { createContext, FunctionComponent, ReactNode, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const UserPermissionsContext = createContext<boolean | undefined>(undefined);

export const UserPermissionsProvider = ({ children } : {children : ReactNode}) => {

    // 0 is default (read only)
    const [permissions, setPermissions] = useState<boolean>(false);

    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const response = await axios.get('/api/users/permissions');
                setPermissions(response.data.permissions === 1);
            } catch (error) {
                console.error('Failed to fetch user permissions:', error);
            }
        };

        fetchPermissions();
    }, []);

    return (
        <UserPermissionsContext.Provider value={ permissions }>
            {children}
        </UserPermissionsContext.Provider>
    );
};

export const useUserPermissions = () => {
    const context = useContext(UserPermissionsContext);
    if (context === undefined) {
        throw new Error('useUserPermissions must be used within a UserPermissionsProvider');
    }
    return context;
};