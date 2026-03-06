import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Users, Clock } from 'lucide-react';

export const HeroSection: React.FC = () => {
    return (
        <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 bg-background text-text-main">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-3xl"></div>
                <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] rounded-full bg-secondary/5 blur-3xl"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-accent/5 blur-3xl"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <span className="inline-block py-1 px-3 rounded-full bg-secondary/10 text-secondary-light font-semibold text-sm mb-6 border border-secondary/20 animate-fade-in">
                    🚀 Smarter Project Management
                </span>

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8">
                    Manage work <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-light to-secondary-light">
                        beautifully and efficiently.
                    </span>
                </h1>

                <p className="mt-4 max-w-2xl text-lg md:text-xl text-text-muted mx-auto mb-10 leading-relaxed">
                    TaskFlow helps teams plan, execute, and deliver projects on time. From small tasks to large-scale initiatives, stay aligned and focused.
                </p>

                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                    <Link
                        to="/signup"
                        className="w-full sm:w-auto px-8 py-4 bg-primary text-white text-lg font-semibold rounded-full hover:bg-primary-light transform hover:-translate-y-1 transition-all duration-300 shadow-xl hover:shadow-primary/30 flex items-center justify-center gap-2 group"
                    >
                        Start for free
                        <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                    </Link>
                    <Link
                        to="/login"
                        className="w-full sm:w-auto px-8 py-4 bg-white text-text-main border border-gray-200 text-lg font-semibold rounded-full hover:border-primary hover:text-primary transition-colors duration-300 shadow-sm"
                    >
                        Log in to Dashboard
                    </Link>
                </div>

                {/* Feature Highlights */}
                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                            <BarChart3 className="text-primary" size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Insightful Reports</h3>
                        <p className="text-text-muted">Get real-time insights into team performance and project progress with beautiful interactive charts.</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-4">
                            <Users className="text-secondary-light" size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Team Collaboration</h3>
                        <p className="text-text-muted">Seamlessly organize into teams, assign tasks, and track cross-functional dependencies.</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                            <Clock className="text-accent" size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">On-time Delivery</h3>
                        <p className="text-text-muted">Track deadlines, identify overdue tasks instantly, and ensure nothing falls through the cracks.</p>
                    </div>
                </div>

                {/* Social Proof */}
                <div className="mt-20 pt-10 border-t border-gray-100">
                    <p className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-8">Trusted by innovative teams worldwide</p>
                    <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Placeholder company logos using text for simplicity */}
                        <span className="text-2xl font-black font-serif">Acme Corp</span>
                        <span className="text-2xl font-bold italic">Globex</span>
                        <span className="text-2xl font-extrabold tracking-widest">SOYUZ</span>
                        <span className="text-2xl font-bold font-mono">Initech</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
