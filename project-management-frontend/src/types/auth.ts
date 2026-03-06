export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'member' | 'manager' | string;
}

export interface AuthResponse {
    success: boolean;
    data: {
        user: User;
        accessToken: string;
    };
    message: string;
}

export interface LoginPayload {
    email: string;
    password?: string;
}

export interface RegisterPayload {
    name: string;
    email: string;
    password?: string;
    role?: string;
}
