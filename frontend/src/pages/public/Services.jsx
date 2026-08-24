import React, { useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { Link, useLocation } from 'react-router-dom';

const serviceList = [
  {
    id: 'airport-pick-drop',
    title: 'Airport Pick & Drop',
    titleBn: 'এয়ারপোর্ট পিক & ড্রপ',
    icon: '✈️',
    desc: 'সময়মতো এয়ারপোর্টে যাতায়াত এবং ইনকামিং ফ্লাইটের জন্য পিক-আপ এবং ড্রপ-অফ সেবা।',
    features: ['২৪/৭ এভেলেবল', 'ফ্লাইট ট্র্যাকিং ব্যবস্থা', 'লাগেজ স্পেসের নিশ্চয়তা'],
  },
  {
    id: 'hourly-car-rental',
    title: 'Hourly Car Rental',
    titleBn: 'ঘণ্টাচুক্তি কার রেন্টাল',
    icon: '⏱️',
    desc: 'শহরের মধ্যে অল্প সময়ের কাজের জন্য ঘণ্টাভিত্তিক সাশ্রয়ী গাড়ি ভাড়া নেওয়ার সুবিধা।',
    features: ['সর্বনিম্ন ২ ঘণ্টা বুকিং', 'জ্বালানি সহ বা ছাড়া', 'শহরের ভিতরে সেরা রেট'],
  },
  {
    id: 'daily-car-rental',
    title: 'Daily Car Rental',
    titleBn: 'দৈনিক কার রেন্টাল',
    icon: '🚗',
    desc: 'একদিন বা একাধিক দিনের জন্য জেলা বা বিভাগীয় শহর ভ্রমণের নিরাপদ ও প্রাইভেট কার সুবিধা।',
    features: ['আনলিমিটেড কিলোমিটার সুবিধা', 'দক্ষ ড্রাইভার সংযুক্ত', 'এসি ও নন-এসি অপশন'],
  },
  {
    id: 'monthly-car-rental',
    title: 'Monthly Car Rental',
    titleBn: 'মাসিক কার রেন্টাল',
    icon: '📅',
    desc: 'দীর্ঘমেয়াদী ব্যবহারের জন্য কর্পোরেট ও ব্যক্তিগত বিশেষ মাসিক রেন্টাল ডিসকাউন্ট প্যাকেজ।',
    features: ['ডিসকাউন্টেড মাসিক রেট', 'ফ্রি রেগুলার মেনটেন্যান্স', 'ড্রাইভার বদলানোর সুবিধা'],
  },
  {
    id: 'wedding-car-rental',
    title: 'Wedding Car Rental',
    titleBn: 'ওয়েডিং কার রেন্টাল',
    icon: '🎉',
    desc: 'বিবাহ, সংবর্ধনা বা উৎসবের জন্য বিশেষ ফুল দিয়ে সুসজ্জিত প্রিমিয়াম লাক্সারি কার।',
    features: ['প্রিমিয়াম ব্র্যান্ডের কার', 'স্পেশাল ডেকোরেশন সাপোর্ট', 'অভিজ্ঞ ভিআইপি ড্রাইভার'],
  },
  {
    id: 'office-pick-drop',
    title: 'Office Pick & Drop',
    titleBn: 'অফিস পিক & ড্রপ',
    icon: '🏢',
    desc: 'কর্মকর্তা ও কর্মচারীদের দৈনন্দিন নিরাপদে অফিসে আনা-নেওয়ার জন্য ডেলি রুট সার্ভিস।',
    features: ['ফিক্সড টাইম শিডিউল', 'মাসিক চুক্তিভিত্তিক বিলিং', 'মাইক্রোবাস ও সিডান অপশন'],
  },
  {
    id: 'group-tour-bus',
    title: 'Group Tour Bus',
    titleBn: 'গ্রুপ ট্যুর বাস',
    icon: '🚌',
    desc: 'পারিবারিক ভ্রমণ, পিকনিক বা কর্পোরেট ইভেন্টের জন্য হাইয়েস, কোস্টার ও লাক্সারি ট্যুর বাস।',
    features: ['১৪-৪৫ সিটের গাড়ি', 'প্যানোরামিক ভিউ উইন্ডো', 'ফ্যামিলি ট্যুর ফ্রেন্ডলি'],
  },
  {
    id: 'emergency-service',
    title: 'Emergency Service',
    titleBn: 'জরুরি সার্ভিস',
    icon: '🚨',
    desc: 'যেকোনো জরুরি অবস্থা বা হুট করে রাইড দরকার হলে তাৎক্ষণিক এক্সপ্রেস কার বুকিং।',
    features: ['১৫-৩০ মিনিটে গাড়ি উপস্থিত', '২৪/৭ ইমার্জেন্সি সাপোর্ট', 'কল সেন্টার সুবিধা'],
  },
];

const Services = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [hash]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            আমাদের <span className="text-emerald-600">সেবাসমূহ</span> (Our Services)
          </h1>
          <p className="mt-3 text-gray-600 text-base sm:text-lg">
            'গাড়ি লাগবে' প্ল্যাটফর্মে আপনার যেকোনো ব্যক্তিগত বা ব্যবসায়িক ভ্রমণের জন্য সেরা মানের ৮টি বিশেষ কার রেন্টাল সেবা।
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {serviceList.map((service) => (
            <div
              key={service.id}
              id={service.id}
              className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col justify-between scroll-mt-24"
            >
              <div>
                <div className="text-4xl mb-4 bg-emerald-50 w-16 h-16 rounded-2xl flex items-center justify-center border border-emerald-100">
                  {service.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{service.title}</h3>
                <h4 className="text-xs font-semibold text-emerald-600 mb-3">{service.titleBn}</h4>
                <p className="text-gray-600 text-xs leading-relaxed mb-4">{service.desc}</p>
                
                <ul className="space-y-1.5 text-[11px] text-gray-500 mb-4">
                  {service.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="text-emerald-500 font-bold">✓</span> {feat}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <Link
                  to="/cars"
                  className="w-full inline-flex justify-center items-center gap-1 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded-xl transition duration-150"
                >
                  গাড়ি ব্রাউজ করুন →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Services;
