import React from 'react';
import { Navbar } from './Component/landing/Navbar';
import { HeroSection } from './Component/landing/HeroSection';
import { Footer } from './Component/landing/Footer';

const LandingPage: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col font-sans">
            <Navbar />

            <main className="flex-grow">
                <HeroSection />

                {/* Additional filler sections for scrolling & demonstration of Nav glassmorphism */}
                <section id="features" className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl font-bold text-text-main mb-6">Why choose TaskFlow?</h2>
                        <div className="w-24 h-1 bg-primary mx-auto mb-10 rounded-full"></div>
                        <p className="text-lg text-text-muted max-w-3xl mx-auto">
                            Our platform brings together the best tools for task tracking, communication, and reporting. Start working smarter, not harder.
                        </p>
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    );
};

export default LandingPage;
