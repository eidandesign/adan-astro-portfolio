import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface NavbarProps {
  isScrolled?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ isScrolled = false }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <motion.nav
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-transparent'
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <motion.a
          href="/"
          className="text-2xl font-bold text-gray-900"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Adan
        </motion.a>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <a href="/" className="text-gray-700 hover:text-gray-900 transition">
            Home
          </a>
          <a href="/portfolio" className="text-gray-700 hover:text-gray-900 transition">
            Portfolio
          </a>
          <a href="/about" className="text-gray-700 hover:text-gray-900 transition">
            About
          </a>
          <motion.a
            href="/contact"
            className="bg-gray-900 text-white px-6 py-2 rounded-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Let's Connect
          </motion.a>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          className="md:hidden bg-white border-t"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="px-6 py-4 space-y-4">
            <a href="/" className="block text-gray-700 hover:text-gray-900">
              Home
            </a>
            <a href="/portfolio" className="block text-gray-700 hover:text-gray-900">
              Portfolio
            </a>
            <a href="/about" className="block text-gray-700 hover:text-gray-900">
              About
            </a>
            <a href="/contact" className="block bg-gray-900 text-white px-6 py-2 rounded-lg">
              Let's Connect
            </a>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};
