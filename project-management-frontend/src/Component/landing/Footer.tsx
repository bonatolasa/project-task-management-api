import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Facebook, Twitter, Linkedin, Github } from 'lucide-react';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <div className="bg-primary text-white p-1.5 rounded-md">
                                <LayoutDashboard size={20} />
                            </div>
                            <span className="text-xl font-bold text-primary">TaskFlow</span>
                        </Link>
                        <p className="text-text-muted text-sm leading-relaxed mb-6">
                            Empowering teams to manage projects efficiently, collaborate seamlessly, and deliver results on time.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                                <span className="sr-only">Facebook</span>
                                <Facebook size={20} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                                <span className="sr-only">Twitter</span>
                                <Twitter size={20} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                                <span className="sr-only">GitHub</span>
                                <Github size={20} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                                <span className="sr-only">LinkedIn</span>
                                <Linkedin size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Product */}
                    <div>
                        <h3 className="text-sm font-semibold text-text-main tracking-wider uppercase mb-4">Product</h3>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-base text-text-muted hover:text-primary transition-colors">Features</a></li>
                            <li><a href="#" className="text-base text-text-muted hover:text-primary transition-colors">Pricing</a></li>
                            <li><a href="#" className="text-base text-text-muted hover:text-primary transition-colors">Security</a></li>
                            <li><a href="#" className="text-base text-text-muted hover:text-primary transition-colors">Integrations</a></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="text-sm font-semibold text-text-main tracking-wider uppercase mb-4">Company</h3>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-base text-text-muted hover:text-primary transition-colors">About</a></li>
                            <li><a href="#" className="text-base text-text-muted hover:text-primary transition-colors">Blog</a></li>
                            <li><a href="#" className="text-base text-text-muted hover:text-primary transition-colors">Careers</a></li>
                            <li><a href="#" className="text-base text-text-muted hover:text-primary transition-colors">Contact</a></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-sm font-semibold text-text-main tracking-wider uppercase mb-4">Support</h3>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-base text-text-muted hover:text-primary transition-colors">Help Center</a></li>
                            <li><a href="#" className="text-base text-text-muted hover:text-primary transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="text-base text-text-muted hover:text-primary transition-colors">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-base text-text-muted mb-4 md:mb-0">
                        &copy; {new Date().getFullYear()} TaskFlow Inc. All rights reserved.
                    </p>
                    <div className="flex space-x-6">
                        <span className="text-sm text-text-muted">Made with ❤️ for developers and managers</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};
