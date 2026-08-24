import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('ইমেইল এবং পাসওয়ার্ড প্রদান করা আবশ্যক।');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(email, password);
      const user = res.data.user;

      // Only allow admin role
      if (user.role !== 'admin') {
        setError('⛔ আপনি অ্যাডমিন নন। অনুগ্রহ করে সাধারণ লগইন পেজ ব্যবহার করুন।');
        setIsSubmitting(false);
        return;
      }

      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'লগইন করতে ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Dark Admin Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-950 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,0.03) 35px, rgba(255,255,255,0.03) 70px)`
          }}></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12 text-center">
          {/* Admin Shield Icon */}
          <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl shadow-emerald-900/50 mb-8">
            <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>

          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            গাড়ি লাগবে
          </h1>
          <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-600/20 border border-emerald-500/30 rounded-full">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Admin Control Panel</span>
          </div>

          <p className="mt-6 text-gray-400 text-sm leading-relaxed max-w-md">
            এটি অ্যাডমিনিস্ট্রেটিভ কন্ট্রোল প্যানেলে প্রবেশের জন্য। শুধুমাত্র অনুমোদিত অ্যাডমিন ব্যবহারকারীরা এই পোর্টালে লগইন করতে পারবেন।
          </p>

          {/* Feature highlights */}
          <div className="mt-10 space-y-3 text-left w-full max-w-xs">
            {[
              { icon: '🚗', text: 'গাড়ি ও ড্রাইভার ব্যবস্থাপনা' },
              { icon: '📊', text: 'বুকিং ও পেমেন্ট মনিটরিং' },
              { icon: '📩', text: 'ভিজিটর বার্তা ও রিভিউ মডারেশন' },
              { icon: '🔒', text: 'সিকিউরড অ্যাক্সেস কন্ট্রোল' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 text-gray-300 text-sm">
                <span className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-base flex-shrink-0">{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Header (visible on small screens) */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg mx-auto mb-4">
              <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900">গাড়ি লাগবে</h1>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Admin Panel</span>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                অ্যাডমিন লগইন
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                অ্যাডমিন প্যানেলে প্রবেশ করতে আপনার ক্রেডেনশিয়াল দিন
              </p>
            </div>

            {error && (
              <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium flex items-start gap-2">
                <span className="text-base mt-0.5">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">অ্যাডমিন ইমেইল</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">📧</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@gari-lagbe.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-gray-900 placeholder-gray-400 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">পাসওয়ার্ড</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔑</span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-gray-900 placeholder-gray-400 text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:from-emerald-800 active:to-teal-800 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:shadow-emerald-600/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 text-sm"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    যাচাই করা হচ্ছে...
                  </span>
                ) : (
                  <>
                    🔐 অ্যাডমিন লগইন করুন
                  </>
                )}
              </button>
            </form>

            {/* Security Notice */}
            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 flex items-start gap-2">
              <span className="text-base mt-0.5">🛡️</span>
              <span>
                <strong>নিরাপত্তা সতর্কতা:</strong> এই পোর্টালটি শুধুমাত্র অনুমোদিত অ্যাডমিনদের জন্য। অননুমোদিত প্রবেশের চেষ্টা রেকর্ড করা হবে।
              </span>
            </div>
          </div>

          {/* Bottom Links */}
          <div className="mt-6 text-center space-y-2">
            <Link
              to="/login"
              className="text-sm text-gray-500 hover:text-emerald-600 font-medium transition"
            >
              ← সাধারণ ইউজার লগইন পেজে যান
            </Link>
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} গাড়ি লাগবে • Gari Lagbe
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
