import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../services/authService';
import type { User, LoginPayload, RegisterPayload, AuthResponse } from '../types/auth';

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;
}

const getStoredUser = (): User | null => {
    try {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    } catch {
        return null;
    }
};

const initialState: AuthState = {
    user: getStoredUser(),
    token: localStorage.getItem('accessToken') || null,
    isLoading: false,
    error: null,
    isAuthenticated: !!localStorage.getItem('accessToken'),
};

export const login = createAsyncThunk<AuthResponse, LoginPayload, { rejectValue: string }>(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await authService.login(credentials);
            if (response.success && response.data?.accessToken) {
                localStorage.setItem('accessToken', response.data.accessToken);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                return response;
            }
            return rejectWithValue(response.message || 'Login failed');
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Login failed');
        }
    }
);

export const registerUser = createAsyncThunk<AuthResponse, RegisterPayload, { rejectValue: string }>(
  'auth/register',
  async (data, { rejectWithValue }) => {
    try {
      const response = await authService.register(data);
      if (response.success && response.data?.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response;
      }
      return rejectWithValue(response.message || 'Registration failed');
    } catch (error: any) {
      // Extract server error message
      const serverMessage = error.response?.data?.message;
      let errorMessage = 'Registration failed';
      if (serverMessage) {
        if (Array.isArray(serverMessage)) {
          errorMessage = serverMessage.join(', '); // Convert array to readable string
        } else if (typeof serverMessage === 'string') {
          errorMessage = serverMessage;
        }
      }
      return rejectWithValue(errorMessage);
    }
  }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            authService.logout();
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.error = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload.data.user;
                state.token = action.payload.data.accessToken;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Register
            .addCase(registerUser.pending, (state) => {
                state.isLoading = true;
                console.log("registerUser.pending");
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload.data.user;
                state.token = action.payload.data.accessToken;
                console.log("registerUser.fulfilled");
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
                console.log("registerUser.rejected");
            });
    },
});

export const { logout, clearError } = authSlice.actions;

export default authSlice.reducer;
