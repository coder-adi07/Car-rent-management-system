import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import contactService from '../../services/contact.service';
import { useAuth } from '../../context/AuthContext';

const Contact = () => {
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });

  // Admin users are automatically redirected to the admin messages page
  if (user?.role === 'admin') {
    return <Navigate to="/admin/messages" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await contactService.submitMessage(formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setError(err.message || 'বার্তা পাঠাতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            যোগাযোগ <span className="text-emerald-600">করুন</span> (Contact Us)
          </h1>
          <p className="mt-3 text-gray-600 text-base sm:text-lg">
            যেকোনো প্রশ্ন, তথ্য বা সহায়তার জন্য আমাদের সাথে যোগাযোগ করতে নিচের ফর্মটি ব্যবহার করুন।
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Contact Details */}
          <div className="bg-emerald-900 text-white p-8 rounded-2xl space-y-6 lg:col-span-1 shadow-lg">
            <h2 className="text-xl font-bold border-b border-emerald-700 pb-3">যোগাযোগের ঠিকানা</h2>
            <div className="space-y-4 text-sm text-emerald-100">
              <p className="flex items-start gap-3">
                <span className="text-xl">📍</span>
                <span>ধানমন্ডি ৩২, ঢাকা-১২০৯, বাংলাদেশ</span>
              </p>
              <p className="flex items-center gap-3">
                <span className="text-xl">📞</span>
                <span>হটলাইন: +৮৮০ ১৭১১-২৩৪৫৬৭</span>
              </p>
              <p className="flex items-center gap-3">
                <span className="text-xl">📧</span>
                <span>ইমেইল: support@gari-lagbe.com</span>
              </p>
              <p className="flex items-center gap-3">
                <span className="text-xl">⏰</span>
                <span>২৪/৭ কাস্টমার সেবা চালু</span>
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2">
            {submitted ? (
              <div className="text-center py-10 space-y-3">
                <span className="text-5xl">✅</span>
                <h3 className="text-xl font-bold text-gray-900">ধন্যবাদ!</h3>
                <p className="text-gray-600 text-sm">
                  আপনার বার্তাটি সফলভাবে পাঠানো হয়েছে। আমাদের কাস্টমার সাপোর্ট টিম দ্রুত আপনার সাথে যোগাযোগ করবে।
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 px-5 py-2 bg-emerald-600 text-white font-semibold text-xs rounded-xl hover:bg-emerald-700 transition"
                >
                  অন্য বার্তা পাঠান
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-xs font-semibold flex items-center justify-between">
                    <span>⚠️ {error}</span>
                    <button onClick={() => setError(null)} className="font-bold text-red-500">✖</button>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">আপনার নাম</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                    placeholder="আপনার নাম লিখুন"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">ইমেইল ঠিকানা</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                      placeholder="example@mail.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">ফোন নম্বর (ঐচ্ছিক)</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                      placeholder="+৮৮০ ১৭XX-XXXXXXX"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">বার্তা / প্রশ্ন</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                    placeholder="আপনার বার্তা বা প্রশ্ন লিখুন..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                      পাঠানো হচ্ছে...
                    </>
                  ) : (
                    'বার্তা পাঠান (Send Message)'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
