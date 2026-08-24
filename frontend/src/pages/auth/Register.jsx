import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'customer',
    licenseNumber: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const setRole = (role) => {
    setFormData((prev) => ({ ...prev, role }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim() || !formData.phone.trim()) {
      setError('সকল প্রয়োজনীয় ফিল্ড পূরণ করুন।');
      return;
    }

    if (formData.password.length < 6) {
      setError('পাসওয়ার্ড ন্যূনতম ৬ অক্ষরের হতে হবে।');
      return;
    }

    if (formData.role === 'driver' && !formData.licenseNumber.trim()) {
      setError('ড্রাইভার হিসেবে নিবন্ধনের জন্য ড্রাইভিং লাইসেন্স নম্বর প্রদান করা আবশ্যক।');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await register(formData);
      const user = res.data.user;

      if (user.role === 'admin') navigate('/admin/dashboard', { replace: true });
      else if (user.role === 'driver') navigate('/driver/dashboard', { replace: true });
      else navigate('/customer/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-emerald-100">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">গাড়ি লাগবে</h1>
          <p className="text-sm text-gray-600 mt-2">নতুন একাউন্ট তৈরি করুন</p>
        </div>

        {/* Role Switcher Buttons */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setRole('customer')}
            className={`py-2 text-sm font-semibold rounded-lg transition ${
              formData.role === 'customer'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            কাস্টমার একাউন্ট
          </button>
          <button
            type="button"
            onClick={() => setRole('driver')}
            className={`py-2 text-sm font-semibold rounded-lg transition ${
              formData.role === 'driver'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ড্রাইভার একাউন্ট
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">পূর্ণ নাম</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="আপনার নাম"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-gray-900 placeholder-gray-400 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ইমেইল ঠিকানা</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="example@mail.com"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-gray-900 placeholder-gray-400 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">মোবাইল নম্বর</label>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="017XXXXXXXX"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-gray-900 placeholder-gray-400 text-sm"
            />
          </div>

          {formData.role === 'driver' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ড্রাইভিং লাইসেন্স নম্বর</label>
              <input
                type="text"
                name="licenseNumber"
                required
                value={formData.licenseNumber}
                onChange={handleChange}
                placeholder="LIC-123456"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-gray-900 placeholder-gray-400 text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">পাসওয়ার্ড</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-gray-900 placeholder-gray-400 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition duration-200 disabled:opacity-50 flex justify-center items-center text-sm"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                রেজিস্ট্রেশন হচ্ছে...
              </span>
            ) : formData.role === 'driver' ? (
              'ড্রাইভার হিসেবে একাউন্ট তৈরি করুন'
            ) : (
              'কাস্টমার হিসেবে একাউন্ট তৈরি করুন'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          ইতোমধ্যে একাউন্ট আছে?{' '}
          <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
            লগইন করুন
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
