import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, LayoutDashboard } from 'lucide-react';

export const Navbar: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className={`fixed w-full z-50 transition-all duration-300 ${isScrolled
                    ? 'bg-white/80 backdrop-blur-md shadow-md py-4'
                    : 'bg-transparent py-6'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="bg-primary text-white p-2 rounded-lg group-hover:bg-primary-light transition-colors duration-300">
                            <LayoutDashboard size={24} />
                        </div>
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-light">
                            TaskFlow
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-8">
                        <a href="#features" className="text-text-main hover:text-primary transition-colors duration-200 font-medium">Features</a>
                        <a href="#testimonials" className="text-text-main hover:text-primary transition-colors duration-200 font-medium">Testimonials</a>
                        <a href="#pricing" className="text-text-main hover:text-primary transition-colors duration-200 font-medium">Pricing</a>
                    </div>

                    {/* CTA Buttons */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link
                            to="/login"
                            className="text-primary font-medium hover:text-primary-light transition-colors duration-200"
                        >
                            Sign In
                        </Link>
                        <Link
                            to="/signup"
                            className="px-5 py-2.5 rounded-full bg-primary text-white font-medium hover:bg-primary-light transform hover:-translate-y-0.5 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            Get Started
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-text-main hover:text-primary focus:outline-none"
                        >
                            {isOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Nav */}
            {isOpen && (
                <div className="md:hidden bg-white shadow-xl absolute w-full left-0 top-full rounded-b-2xl animate-fade-in-down border-t border-gray-100">
                    <div className="px-4 pt-2 border-b border-gray-100 pb-4 space-y-1 sm:px-3">
                        <a href="#features" className="block px-3 py-2 rounded-md text-base font-medium text-text-main hover:text-primary hover:bg-background">Features</a>
                        <a href="#testimonials" className="block px-3 py-2 rounded-md text-base font-medium text-text-main hover:text-primary hover:bg-background">Testimonials</a>
                        <a href="#pricing" className="block px-3 py-2 rounded-md text-base font-medium text-text-main hover:text-primary hover:bg-background">Pricing</a>
                    </div>
                    <div className="px-5 py-5 space-y-3">
                        <Link
                            to="/login"
                            className="block w-full text-center px-4 py-3 border border-primary text-primary font-medium rounded-lg hover:bg-primary/5 transition-colors"
                        >
                            Sign In
                        </Link>
                        <Link
                            to="/signup"
                            className="block w-full text-center px-4 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-light shadow-md transition-colors"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
};
