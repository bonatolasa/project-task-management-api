import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store/store';
import { registerUser } from '../../store/authSlice';
import toast from 'react-hot-toast';
import { LayoutDashboard } from 'lucide-react';
import { normalizeRole } from '../../utils/auth';

export const Signup: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { isLoading, error } = useSelector((state: RootState) => state.auth);

    // Check if passwords match
    const passwordsMatch = password === confirmPassword;
    const isFormValid = name && email && password && confirmPassword && passwordsMatch;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!passwordsMatch) {
            toast.error('Passwords do not match');
            return;
        }

        const resultAction = await dispatch(registerUser({ name, email, password }));

        if (registerUser.fulfilled.match(resultAction)) {
            toast.success('Registration successful!');
            const role = normalizeRole(resultAction.payload.data.user.role);
            if (role === 'admin') navigate('/admin');
            else if (role === 'manager') navigate('/manager');
            else navigate('/dashboard');
        } else {
            const errorMsg = (resultAction.payload as string) || 'Registration failed';
            toast.error(errorMsg);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
                <div className="text-center">
                    <Link to="/" className="inline-flex items-center gap-2 mb-6">
                        <div className="bg-primary text-white p-2 rounded-lg">
                            <LayoutDashboard size={28} />
                        </div>
                    </Link>
                    <h2 className="mt-2 text-3xl font-extrabold text-text-main">Create an account</h2>
                    <p className="mt-2 text-sm text-text-muted">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-primary hover:text-primary-light">
                            Sign in here
                        </Link>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-danger/10 border-l-4 border-danger p-4 mb-4 rounded">
                            <p className="text-sm text-danger">{error}</p>
                        </div>
                    )}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-main mb-1" htmlFor="name">
                                Full Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-text-main rounded-lg focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                placeholder="John"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-main mb-1" htmlFor="email-address">
                                Email address
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-text-main rounded-lg focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-main mb-1" htmlFor="password">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-text-main rounded-lg focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-main mb-1" htmlFor="confirmPassword">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`appearance-none relative block w-full px-3 py-3 border ${confirmPassword && !passwordsMatch
                                    ? 'border-danger'
                                    : 'border-gray-300'
                                    } placeholder-gray-500 text-text-main rounded-lg focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm`}
                                placeholder="••••••••"
                            />
                            {confirmPassword && !passwordsMatch && (
                                <p className="mt-1 text-sm text-danger">Passwords do not match</p>
                            )}
                        </div>
                        {/* Role selection removed – uncomment below if needed 
                        <div>
                            <label className="block text-sm font-medium text-text-main mb-1" htmlFor="role">
                                Select Role
                            </label>
                            <select
                                id="role"
                                name="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 text-text-main rounded-lg focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm bg-white"
                            >
                                <option value="member">Team Member</option>
                                <option value="manager">Project Manager</option>
                                <option value="admin">Administrator</option>
                            </select>
                        </div>
                        */}
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading || !isFormValid}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Creating account...' : 'Sign up'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
