import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationDropdown from '../notifications/NotificationDropdown';
import { getImageUrl } from '../../utils/imageUrl';

const serviceItems = [
  { name: '✈️ এয়ারপোর্ট পিক & ড্রপ (Airport Pick & Drop)', link: '/services#airport-pick-drop' },
  { name: '⏱️ ঘণ্টাচুক্তি কার রেন্টাল (Hourly Car Rental)', link: '/services#hourly-car-rental' },
  { name: '🚗 দৈনিক কার রেন্টাল (Daily Car Rental)', link: '/services#daily-car-rental' },
  { name: '📅 মাসিক কার রেন্টাল (Monthly Car Rental)', link: '/services#monthly-car-rental' },
  { name: '🎉 ওয়েডিং কার রেন্টাল (Wedding Car Rental)', link: '/services#wedding-car-rental' },
  { name: '🏢 অফিস পিক & ড্রপ (Office Pick & Drop)', link: '/services#office-pick-drop' },
  { name: '🚌 গ্রুপ ট্যুর বাস (Group Tour Bus)', link: '/services#group-tour-bus' },
  { name: '🚨 জরুরি সার্ভিস (Emergency Service)', link: '/services#emergency-service' },
];

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <img src="/logo.png" alt="গাড়ি লাগবে" className="h-10 w-auto object-contain rounded-lg transition group-hover:scale-105" />
          <span className="text-xl font-extrabold text-emerald-800 tracking-tight">গাড়ি লাগবে</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            to="/"
            className={`transition ${isActive('/') ? 'text-emerald-600 font-bold' : 'text-gray-600 hover:text-emerald-600'}`}
          >
            হোম
          </Link>

          {/* Services Hover Dropdown Menu */}
          <div className="relative group py-5 flex items-center">
            <Link
              to="/services"
              className={`flex items-center gap-1.5 transition text-sm ${
                isActive('/services') ? 'text-emerald-600 font-bold' : 'text-gray-600 hover:text-emerald-600'
              }`}
            >
              <span>সার্ভিস</span>
              <svg
                className="w-3.5 h-3.5 text-emerald-600 transition-transform duration-200 group-hover:rotate-180"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </Link>

            {/* Dropdown Menu - Opens on Hover */}
            <div className="absolute top-full left-0 hidden group-hover:block w-72 bg-white text-gray-800 shadow-2xl rounded-xl py-2 z-50 border border-emerald-100 animate-fadeIn">
              {serviceItems.map((item, idx) => (
                <Link
                  key={idx}
                  to={item.link}
                  className="block px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {user?.role === 'driver' ? (
            <Link
              to="/driver/bookings"
              className={`transition ${isActive('/driver/bookings') ? 'text-emerald-600 font-bold' : 'text-gray-600 hover:text-emerald-600'}`}
            >
              বুকিংসমূহ
            </Link>
          ) : (
            <Link
              to="/cars"
              className={`transition ${isActive('/cars') ? 'text-emerald-600 font-bold' : 'text-gray-600 hover:text-emerald-600'}`}
            >
              গাড়ির তালিকা
            </Link>
          )}

          <Link
            to="/about"
            className={`transition ${isActive('/about') ? 'text-emerald-600 font-bold' : 'text-gray-600 hover:text-emerald-600'}`}
          >
            আমাদের সম্পর্কে
          </Link>

          {user?.role !== 'admin' && (
            <Link
              to="/contact"
              className={`transition ${isActive('/contact') ? 'text-emerald-600 font-bold' : 'text-gray-600 hover:text-emerald-600'}`}
            >
              যোগাযোগ
            </Link>
          )}
        </nav>

        {/* User Auth Buttons / Profile Trigger */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <NotificationDropdown />
              
              {/* Profile Slide Drawer Toggle Button */}
              <button
                onClick={() => setProfileDrawerOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl hover:bg-emerald-100 font-bold text-xs transition shadow-sm group"
                title="আমার অ্যাকাউন্ট মেনু খুলুন"
              >
                <span className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-extrabold shadow-inner overflow-hidden border border-emerald-300">
                  {user?.profileImage ? (
                    <img src={getImageUrl(user.profileImage)} alt={user.name} className="w-full h-full object-cover" />
                  ) : user?.name ? (
                    user.name[0].toUpperCase()
                  ) : (
                    '👤'
                  )}
                </span>
                <span>{user?.name}</span>
                <span className="text-[10px] bg-emerald-700 text-white px-2 py-0.5 rounded-md uppercase font-bold tracking-wider">
                  {user?.role}
                </span>
                <span className="text-emerald-700 text-sm font-extrabold ml-1 group-hover:scale-110 transition-transform">☰</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm text-emerald-700 font-semibold hover:text-emerald-800 transition"
              >
                লগইন
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition shadow-sm"
              >
                রেজিস্ট্রেশন
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="md:hidden flex items-center gap-2">
          {isAuthenticated && (
            <button
              onClick={() => setProfileDrawerOpen(true)}
              className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200 flex items-center gap-1.5"
            >
              <span className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center bg-emerald-600 text-white text-[10px]">
                {user?.profileImage ? (
                  <img src={getImageUrl(user.profileImage)} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  '👤'
                )}
              </span>
              <span>{user?.name?.split(' ')[0]}</span> ☰
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-600 hover:text-emerald-600 focus:outline-none"
          >
            {mobileMenuOpen ? '✖' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pt-2 pb-4 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-gray-700 hover:text-emerald-600 font-medium py-1"
          >
            হোম
          </Link>
          
          <div className="border-t border-gray-100 pt-2">
            <button
              onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
              className="w-full flex items-center justify-between py-1 text-sm font-medium text-gray-700 hover:text-emerald-600 focus:outline-none"
            >
              <span className="font-semibold">সার্ভিসসমূহ</span>
              <svg
                className={`w-4 h-4 text-emerald-600 transition-transform duration-200 ${
                  mobileServicesOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {mobileServicesOpen && (
              <div className="pl-3 mt-2 space-y-1.5 border-l-2 border-emerald-500">
                {serviceItems.map((item, idx) => (
                  <Link
                    key={idx}
                    to={item.link}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setMobileServicesOpen(false);
                    }}
                    className="block text-xs text-gray-600 hover:text-emerald-700 py-1"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/cars"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-gray-700 hover:text-emerald-600 font-medium py-1"
          >
            গাড়ির তালিকা
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-gray-700 hover:text-emerald-600 font-medium py-1"
          >
            আমাদের সম্পর্কে
          </Link>
          {user?.role !== 'admin' && (
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-gray-700 hover:text-emerald-600 font-medium py-1"
            >
              যোগাযোগ
            </Link>
          )}

          {isAuthenticated ? (
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setProfileDrawerOpen(true);
                }}
                className="w-full text-left py-2 px-3 text-xs bg-emerald-50 text-emerald-800 font-bold rounded-lg flex items-center justify-between"
              >
                <span>📂 আমার অপশন (বুকিং, পেমেন্ট, রিভিউ)</span>
                <span>▶</span>
              </button>
            </div>
          ) : (
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 text-xs border border-emerald-600 text-emerald-700 rounded-lg font-semibold"
              >
                লগইন
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 text-xs bg-emerald-600 text-white rounded-lg font-semibold"
              >
                রেজিস্ট্রেশন
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Profile Slide Drawer Component */}
      {isAuthenticated && (
        <div
          className={`fixed inset-0 z-50 transition-all duration-300 ${
            profileDrawerOpen ? 'visible opacity-100' : 'invisible opacity-0 pointer-events-none'
          }`}
        >
          {/* Backdrop Overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setProfileDrawerOpen(false)}
          />

          {/* Sliding Panel */}
          <aside
            className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${
              profileDrawerOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-emerald-900 bg-emerald-800 text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white text-emerald-800 font-extrabold text-lg flex items-center justify-center shadow-md overflow-hidden border border-emerald-300">
                  {user?.profileImage ? (
                    <img src={getImageUrl(user.profileImage)} alt={user.name} className="w-full h-full object-cover" />
                  ) : user?.name ? (
                    user.name[0].toUpperCase()
                  ) : (
                    '👤'
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-wide">{user?.name}</h3>
                  <span className="text-[10px] bg-emerald-600 text-emerald-100 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">
                    {user?.role}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setProfileDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-emerald-700 hover:bg-emerald-600 text-white flex items-center justify-center font-bold text-sm transition"
                title="বন্ধ করুন"
              >
                ✕
              </button>
            </div>

            {/* Drawer Menu Items */}
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              <div className="px-3 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                আমার অ্যাকাউন্ট নেভিগেশন
              </div>

              {/* Customer Specific Links */}
              {user?.role === 'customer' && (
                <>
                  <Link
                    to="/customer/bookings"
                    onClick={() => setProfileDrawerOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                      isActive('/customer/bookings')
                        ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">📋</span>
                    <span>বুকিংসমূহ</span>
                  </Link>

                  <Link
                    to="/customer/payments"
                    onClick={() => setProfileDrawerOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                      isActive('/customer/payments')
                        ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">💳</span>
                    <span>পেমেন্ট ইতিহাস</span>
                  </Link>

                  <Link
                    to="/customer/rentals"
                    onClick={() => setProfileDrawerOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                      isActive('/customer/rentals')
                        ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">🚘</span>
                    <span>আমার রেন্টালসমূহ</span>
                  </Link>

                  <Link
                    to="/customer/reviews"
                    onClick={() => setProfileDrawerOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                      isActive('/customer/reviews')
                        ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">⭐</span>
                    <span>আমার রিভিউসমূহ</span>
                  </Link>
                </>
              )}

              {/* Admin Specific Links */}
              {user?.role === 'admin' && (
                <>
                  <Link
                    to="/admin/cars/add"
                    onClick={() => setProfileDrawerOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                      isActive('/admin/cars/add')
                        ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">➕</span>
                    <span>নতুন গাড়ি যোগ করুন (Add Car)</span>
                  </Link>

                  <Link
                    to="/admin/cars"
                    onClick={() => setProfileDrawerOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                      isActive('/admin/cars')
                        ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">🚗</span>
                    <span>গাড়ি ব্যবস্থাপনা</span>
                  </Link>

                  <Link
                    to="/admin/drivers"
                    onClick={() => setProfileDrawerOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                      isActive('/admin/drivers')
                        ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">👨‍✈️</span>
                    <span>ড্রাইভার ব্যবস্থাপনা</span>
                  </Link>

                  <Link
                    to="/admin/bookings"
                    onClick={() => setProfileDrawerOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                      isActive('/admin/bookings')
                        ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">📑</span>
                    <span>বুকিং ব্যবস্থাপনা</span>
                  </Link>

                  <Link
                    to="/admin/payments"
                    onClick={() => setProfileDrawerOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                      isActive('/admin/payments')
                        ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">💳</span>
                    <span>পেমেন্ট রেকর্ড</span>
                  </Link>

                  <Link
                    to="/admin/rentals"
                    onClick={() => setProfileDrawerOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                      isActive('/admin/rentals')
                        ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">📄</span>
                    <span>রেন্টাল চুক্তি</span>
                  </Link>

                  <Link
                    to="/admin/reviews"
                    onClick={() => setProfileDrawerOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                      isActive('/admin/reviews')
                        ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">⭐</span>
                    <span>রিভিউ মডারেশন</span>
                  </Link>

                  <Link
                    to="/admin/messages"
                    onClick={() => setProfileDrawerOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                      isActive('/admin/messages')
                        ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">📩</span>
                    <span>ভিজিটর বার্তা (Messages)</span>
                  </Link>
                </>
              )}

              {/* Driver Specific Links */}
              {user?.role === 'driver' && (
                <>
                  <Link
                    to="/driver/bookings"
                    onClick={() => setProfileDrawerOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                      isActive('/driver/bookings')
                        ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">🚗</span>
                    <span>আমার বুকিংসমূহ</span>
                  </Link>

                  <Link
                    to="/driver/profile/edit"
                    onClick={() => setProfileDrawerOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                      isActive('/driver/profile/edit')
                        ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">✏️</span>
                    <span>প্রোফাইল সম্পাদনা (Edit Profile)</span>
                  </Link>
                </>
              )}

              <div className="pt-3 border-t border-gray-100 mt-2">
                <Link
                  to={`/${user?.role}/dashboard`}
                  onClick={() => setProfileDrawerOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-emerald-700 transition"
                >
                  <span className="text-lg">📊</span>
                  <span>ড্যাশবোর্ড ({user?.role})</span>
                </Link>
              </div>

              <div className="pt-1">
                <Link
                  to="/notifications"
                  onClick={() => setProfileDrawerOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl text-sm font-semibold transition"
                >
                  <span className="text-lg">🔔</span>
                  <span>নোটিফিকেশনস</span>
                </Link>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => {
                  setProfileDrawerOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 font-semibold text-sm rounded-xl transition"
              >
                🚪 সাইনআউট / লগআউট
              </button>
            </div>
          </aside>
        </div>
      )}
    </header>
  );
};

export default Navbar;
