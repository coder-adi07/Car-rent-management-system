import React from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            আমাদের <span className="text-emerald-600">সম্পর্কে</span> (About Us)
          </h1>
          <p className="mt-3 text-gray-600 text-base sm:text-lg">
            'গাড়ি লাগবে' হলো বাংলাদেশের একটি নির্ভরযোগ্য ও আধুনিক কার রেন্টাল ম্যানেজমেন্ট প্ল্যাটফর্ম।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-12">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">আমাদের লক্ষ্য (Our Mission)</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              আমরা গাড়ি রেন্টাল প্রক্রিয়াকে সহজ, দ্রুত এবং স্বচ্ছ করতে প্রতিশ্রুতিবদ্ধ। গ্রাহক এবং গাড়ি মালিক/ড্রাইভার উভয়ের মধ্যে একটি বিশ্বস্ত মেলবন্ধন তৈরি করাই আমাদের প্রধান উদ্দেশ্য।
            </p>
            <h2 className="text-2xl font-bold text-gray-900 pt-4">কেন আমাদের নির্বাচন করবেন?</h2>
            <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
              <li>সহজ ও নিরাপদ অনলাইন বুকিং ব্যবস্থা</li>
              <li>মানসম্পন্ন ও সময়মতো সার্ভিস নিশ্চিতকরণ</li>
              <li>স্বচ্ছ এবং ন্যায্য মূল্য নির্ধারণ</li>
              <li>২৪/৭ কাস্টমার সাপোর্ট সার্ভিস</li>
            </ul>
          </div>

          <div className="bg-emerald-800 text-white p-8 rounded-2xl shadow-lg flex flex-col justify-between h-full">
            <div>
              <span className="text-5xl">🚗</span>
              <h3 className="text-2xl font-bold mt-4">সহজে পছন্দের গাড়ি বুক করুন</h3>
              <p className="mt-2 text-emerald-100 text-sm leading-relaxed">
                আপনার যেকোনো প্রয়োজনে কয়েক ক্লিকেই বুক করতে পারবেন আপনার পছন্দের গাড়ি। আজই ট্রাই করুন 'গাড়ি লাগবে'।
              </p>
            </div>
            <div className="mt-8">
              <Link
                to="/cars"
                className="inline-block px-6 py-3 bg-white text-emerald-800 font-bold rounded-xl hover:bg-emerald-50 transition"
              >
                গাড়ির তালিকা দেখুন
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
