import api from './api';
import type { LoginPayload, RegisterPayload, AuthResponse } from '../types/auth';

export const authService = {
    login: async (data: LoginPayload): Promise<AuthResponse> => {
        const response = await api.post('auth/login', data);
        return response.data;
    },

    register: async (data: RegisterPayload): Promise<AuthResponse> => {
        const response = await api.post('auth/register', data);
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
    }
};
