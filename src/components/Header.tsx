import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Settings, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/documents', label: 'Documents' },
    { path: '/history', label: 'History' },
    { path: '/settings', label: 'Settings' },
  ];

  return (
    <header className="w-full bg-background border-b border-primary/10 sticky top-0 z-50">
      <div className="max-w-[120rem] mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-heading text-xl text-primary flex items-center gap-2">
          <span className="text-2xl">📚</span>
          DocuHelper
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`font-paragraph text-base transition-colors ${
                isActive(link.path)
                  ? 'text-secondary font-medium'
                  : 'text-primary hover:text-secondary'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="hidden md:flex rounded-full"
          >
            <Link to="/settings">
              <Settings className="w-5 h-5" />
            </Link>
          </Button>
          
          <Button 
            asChild
            className="hidden md:flex bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 h-11"
          >
            <Link to="/#query">Ask Question</Link>
          </Button>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-primary/10 bg-background">
          <nav className="px-6 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2 font-paragraph text-base transition-colors ${
                  isActive(link.path)
                    ? 'text-secondary font-medium'
                    : 'text-primary hover:text-secondary'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/#query"
              onClick={() => setMobileMenuOpen(false)}
              className="block mt-4"
            >
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full h-11">
                Ask Question
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
