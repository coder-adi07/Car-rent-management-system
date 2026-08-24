import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { useAuth } from '../../context/AuthContext';

const Home = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
          সহজ ও নিরাপদ কার রেন্টাল সেবা <span className="text-emerald-600">গাড়ি লাগবে</span>
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl">
          বাংলাদেশের সেরা এবং বিশ্বস্ত কার রেন্টাল প্লাটফর্ম। আপনার পছন্দের গাড়ি ব্রাউজ ও বুক করুন অথবা ড্রাইভার হিসেবে যোগ দিয়ে ইনকাম শুরু করুন।
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            to="/cars"
            className="px-8 py-4 bg-emerald-600 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-emerald-700 transition flex items-center gap-2"
          >
            🚗 গাড়ি দেখুন (Browse Cars)
          </Link>

          {!isAuthenticated ? (
            <>
              <Link
                to="/register"
                className="px-8 py-4 bg-teal-700 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-teal-800 transition flex items-center gap-2"
              >
                👨‍✈️ অ্যাকাউন্ট খুলুন (Register)
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 bg-white text-emerald-700 border-2 border-emerald-600 font-bold text-lg rounded-xl hover:bg-emerald-50 transition"
              >
                লগইন করুন
              </Link>
            </>
          ) : (
            <Link
              to={`/${user?.role}/dashboard`}
              className="px-8 py-4 bg-white text-emerald-700 border-2 border-emerald-600 font-bold text-lg rounded-xl hover:bg-emerald-50 transition"
            >
              আমার ড্যাশবোর্ড ({user?.role})
            </Link>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
