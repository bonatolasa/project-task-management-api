import { Hero } from './components/Hero';
import { About } from './components/About';
import { Services } from './components/Services';
import { Expertise } from './components/Expertise';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useState } from 'react';

const links = [
  { href: '#about', label: 'About' },
  { href: '#services', label: 'Services' },
  { href: '#expertise', label: 'Expertise' },
  { href: '#contact', label: 'Contact' },
];

const LandingPage = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/70 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3 lg:px-8">
          <a href="#home" className="flex items-center gap-3">
            <img src="/debo-logo.png" alt="Debo Engineering logo" className="h-9 w-auto" />
            <span className="hidden text-sm font-semibold tracking-wide text-slate-800 sm:inline">
              Debo Engineering
            </span>
          </a>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-700 md:flex">
            {links.map((item) => (
              <a key={item.href} href={item.href} className="transition hover:text-cyan-800">
                {item.label}
              </a>
            ))}
            <Link to="/login" className="rounded-md border border-slate-300 px-4 py-2 hover:border-cyan-700 hover:text-cyan-800">
              Sign In
            </Link>
          </nav>

          <button className="md:hidden" onClick={() => setOpen((v) => !v)}>
            <Menu size={20} />
          </button>
        </div>

        {open && (
          <div className="border-t border-slate-200 bg-white px-6 py-4 md:hidden">
            <div className="flex flex-col gap-3 text-sm">
              {links.map((item) => (
                <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
                  {item.label}
                </a>
              ))}
              <Link to="/login" className="font-semibold text-cyan-800" onClick={() => setOpen(false)}>
                Sign In
              </Link>
            </div>
          </div>
        )}
      </header>

      <main>
        <Hero />
        <About />
        <Services />
        <Expertise />
        <Contact />
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;
