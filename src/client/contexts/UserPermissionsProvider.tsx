import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router';
import { toast } from 'sonner';
import api from '@/axiosInterceptor';

const UserPermissionsContext = createContext<boolean | undefined | null>(undefined);

export const UserPermissionsProvider = ({ children }: { children: ReactNode }) => {

    // 0 is default (read only)
    const [permissions, setPermissions] = useState<boolean | null>();
    const location = useLocation();

    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const response = await api('/api/users/permissions');
                setPermissions(response.data.permissions === 1);
            } catch (error) {
                if (location.pathname !== '/login') {
                    toast.error('Failed to fetch user permissions:')
                    console.error({ message: 'Failed to fetch user permissions:', error });
                }
                setPermissions(null);
            }
        };

        fetchPermissions();
    }, [location.pathname]);

    return (
        <UserPermissionsContext.Provider value={permissions}>
            {permissions !== undefined && children}
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