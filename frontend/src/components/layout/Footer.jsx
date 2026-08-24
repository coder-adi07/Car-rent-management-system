import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Footer = () => {
  const { user } = useAuth();
  return (
    <footer className="bg-gray-900 text-gray-400 text-xs border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-gray-800">
          {/* Col 1: Brand & Bio */}
          <div className="space-y-3 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 text-white font-extrabold text-xl">
              <img src="/logo.png" alt="গাড়ি লাগবে" className="h-9 w-auto object-contain rounded-md bg-white p-0.5" />
              <span>গাড়ি লাগবে</span>
            </Link>
            <p className="text-gray-400 leading-relaxed text-xs">
              বাংলাদেশের সবচেয়ে সহজ, দ্রত ও নিরাপদ অনলাইন কার রেন্টাল প্লাটফর্ম। আপনার যেকোনো ভ্রমণের সঙ্গী হতে আমরা সর্বদা প্রস্তুত।
            </p>
            <div className="pt-2 flex items-center gap-3 text-lg">
              <span className="cursor-pointer hover:text-emerald-400 transition" title="Facebook">🌐</span>
              <span className="cursor-pointer hover:text-emerald-400 transition" title="WhatsApp">💬</span>
              <span className="cursor-pointer hover:text-emerald-400 transition" title="Email">✉️</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide">দ্রুত লিঙ্কসমূহ</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-emerald-400 transition">হোম পেজ</Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-emerald-400 transition">সার্ভিসসমূহ</Link>
              </li>
              <li>
                <Link to="/cars" className="hover:text-emerald-400 transition">গাড়ির তালিকা দেখুন</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-emerald-400 transition">আমাদের সম্পর্কে</Link>
              </li>
              {user?.role === 'admin' ? (
                <li>
                  <Link to="/admin/messages" className="hover:text-emerald-400 transition text-emerald-400 font-semibold">ভিজিটর বার্তা (Messages)</Link>
                </li>
              ) : (
                <li>
                  <Link to="/contact" className="hover:text-emerald-400 transition">যোগাযোগ করুন</Link>
                </li>
              )}
            </ul>
          </div>

          {/* Col 3: Rental Services */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide">আমাদের সেবাসমূহ</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>দৈনিক কার রেন্টাল</li>
              <li>ড্রাইভারসহ বিশেষ ট্রিপ</li>
              <li>সেলফ ডাইভ সুবিধা</li>
              <li>কর্পোরেট ও এয়ারপোর্ট ড্রপ</li>
            </ul>
          </div>

          {/* Col 4: Contact Info */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide">যোগাযোগ করুন</h4>
            <div className="space-y-2 text-xs text-gray-400">
              <p>📍 ধানমন্ডি ৩২, ঢাকা-১২০৯, বাংলাদেশ</p>
              <p>📞 হটলাইন: +৮৮০ ১৭১১-২৩ND৬৭</p>
              <p>📧 ইমেইল: support@gari-lagbe.com</p>
              <p>⏰ সেবার সময়: ২৪/৭ খোলা</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[11px] text-gray-500">
          <p>© {new Date().getFullYear()} গাড়ি লাগবে (Gari Lagbe)। সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex gap-4">
            <span className="hover:text-gray-400 cursor-pointer">গোপনীয়তা নীতি</span>
            <span className="hover:text-gray-400 cursor-pointer">শর্তাবলী</span>
            <span className="hover:text-gray-400 cursor-pointer">এফএকিউ</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
