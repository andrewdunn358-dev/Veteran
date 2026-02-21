import { Outlet, Link, useLocation } from 'react-router-dom'
import { Menu, X, Radio, Phone, Shield, Users, Mail, FileText, Lock } from 'lucide-react'
import { useState } from 'react'

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_ae8f8501-55e8-47a0-8c0c-262b1bbbdefe/artifacts/ny233qxa_Gemini_Generated_Image_u4tpnxu4tpnxu4tp-removebg-preview.png'
const FRANKIES_POD_LOGO = 'https://customer-assets.emergentagent.com/job_626f7586-925a-4eee-97a9-1ff3951998a4/artifacts/lfa2324z_Frankies-Pod_Youtube_logo.png'
const STANDING_TALL_LOGO = 'https://customer-assets.emergentagent.com/job_626f7586-925a-4eee-97a9-1ff3951998a4/artifacts/wn5tds79_image.png'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About the App' },
  { to: '/ai-team', label: 'Meet the AI Team' },
  { to: '/contact', label: 'Contact' },
]

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <header className="bg-primary-dark/95 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <img src={LOGO_URL} alt="Radio Check" className="h-10 w-10 group-hover:scale-105 transition-transform" />
              <span className="text-xl font-bold text-white">Radio Check</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === link.to
                      ? 'text-accent-teal'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <a
                href="https://app.radiocheck.me/login"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-accent-teal hover:bg-accent-teal/90 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Staff Portal
              </a>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/10">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-3 text-base font-medium ${
                    location.pathname === link.to
                      ? 'text-accent-teal'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <a
                href="https://app.radiocheck.me/login"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 bg-accent-teal hover:bg-accent-teal/90 text-white px-4 py-3 rounded-lg text-base font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Staff Portal
              </a>
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-primary-dark border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <img src={LOGO_URL} alt="Radio Check" className="h-10 w-10" />
                <span className="text-xl font-bold text-white">Radio Check</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Your digital hand on the shoulder when it matters most. Peer support and AI companionship for veterans and serving personnel.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-white text-sm transition-colors">Home</Link></li>
                <li><Link to="/about" className="text-gray-400 hover:text-white text-sm transition-colors">About the App</Link></li>
                <li><Link to="/ai-team" className="text-gray-400 hover:text-white text-sm transition-colors">Meet the AI Team</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white text-sm transition-colors">Contact Us</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy & GDPR</Link></li>
                <li><Link to="/legal" className="text-gray-400 hover:text-white text-sm transition-colors">Terms & Disclaimers</Link></li>
              </ul>
            </div>

            {/* Emergency */}
            <div>
              <h3 className="text-white font-semibold mb-4">Emergency</h3>
              <p className="text-gray-400 text-sm mb-2">In an emergency, always call:</p>
              <a href="tel:999" className="text-red-400 font-bold text-lg hover:text-red-300 transition-colors">999</a>
              <p className="text-gray-400 text-sm mt-4 mb-2">Samaritans (24/7):</p>
              <a href="tel:116123" className="text-accent-green font-semibold hover:text-accent-green/80 transition-colors">116 123</a>
            </div>
          </div>

          {/* Supporters */}
          <div className="mt-10 pt-8 border-t border-white/10">
            <p className="text-center text-gray-500 text-xs uppercase tracking-wider mb-6">Proudly Supported By</p>
            <div className="flex justify-center items-center gap-8 flex-wrap">
              <a href="https://www.youtube.com/@FrankiesPod" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <img src={FRANKIES_POD_LOGO} alt="Frankie's Pod" className="h-12 object-contain" />
              </a>
              <a href="https://www.standingtall.co.uk/" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <img src={STANDING_TALL_LOGO} alt="Standing Tall" className="h-14 object-contain bg-white rounded p-1" />
              </a>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} Radio Check. All rights reserved.
            </p>
            <p className="text-gray-600 text-xs mt-2">
              Radio Check is not a substitute for professional medical advice, diagnosis, or treatment.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
