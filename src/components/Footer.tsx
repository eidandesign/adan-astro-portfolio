import React from 'react';
import { motion } from 'framer-motion';

interface SocialLink {
  label: string;
  url: string;
  icon: string;
}

interface FooterProps {
  email?: string;
  socialLinks?: SocialLink[];
}

export const Footer: React.FC<FooterProps> = ({ 
  email = 'design.adan@gmail.com',
  socialLinks = [
    { label: 'LinkedIn', url: 'https://linkedin.com/in/acareta', icon: 'linkedin' },
    { label: 'Behance', url: 'https://behance.net/eidan', icon: 'behance' },
    { label: 'Dribbble', url: 'https://dribbble.com/eidan', icon: 'dribbble' },
    { label: 'Instagram', url: 'https://instagram.com/eidan', icon: 'instagram' },
  ]
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-2xl font-bold mb-2">Adan Careta</h3>
            <p className="text-gray-600">Senior Product Designer</p>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h4 className="font-semibold mb-4">Contact</h4>
            <a 
              href={`mailto:${email}`}
              className="text-gray-600 hover:text-gray-900 transition"
            >
              {email}
            </a>
          </motion.div>

          {/* Social */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className="font-semibold mb-4">Follow</h4>
            <div className="flex gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 transition"
                  aria-label={link.label}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom */}
        <motion.div
          className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="text-gray-600 text-sm">
            © {currentYear} Adan Careta. All rights reserved.
          </p>
          <p className="text-gray-600 text-sm">
            Designed & Built with Astro + Sanity
          </p>
        </motion.div>
      </div>
    </footer>
  );
};
