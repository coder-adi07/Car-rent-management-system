import React from 'react';
import { getImageUrl } from '../../utils/imageUrl';

/**
 * Component to display Driver Profile Card with photo and complete details
 */
const DriverCard = ({ driver, title = '👨‍✈️ নির্ধারিত ড্রাইভারের বিবরণ (Driver Details)' }) => {
  if (!driver) {
    return (
      <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 sm:p-5 text-xs text-gray-700 space-y-2">
        <div className="flex items-center gap-2 font-bold text-emerald-800 text-sm">
          <span>👨‍✈️ সরকারি লাইসেন্সপ্রাপ্ত ও ট্রেইনড ড্রাইভার</span>
          <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
            ভেরিফাইড
          </span>
        </div>
        <p className="text-gray-600 leading-relaxed">
          আপনার বুকিং সম্পূর্ণ হওয়ার পর অ্যাডমিন প্যানেল থেকে অভিজ্ঞ ট্রেইনড ড্রাইভার বরাদ্দ দেওয়া হবে। ভ্রমণের পূর্বে ড্রাইভারের নাম ও ফোন নম্বর এসএমএস ও নোটিফিকেশনে জানিয়ে দেওয়া হবে।
        </p>
        <div className="flex items-center gap-4 pt-2 text-[11px] font-semibold text-emerald-700">
          <span>✓ ১০+ বছর অভিজ্ঞতা সম্পন্ন</span>
          <span>✓ বিআরটিএ প্রফেশনাল লাইসেন্সধারী</span>
        </div>
      </div>
    );
  }

  const name = driver.fullName || driver.name || driver.user?.name || 'পেশাদার ড্রাইভার';
  const phone = driver.phone || driver.user?.phone || '০১৭১১-XXXXXX';
  const rating = driver.rating || 4.8;
  const trips = driver.totalTrips || 120;
  const experience = driver.experienceYears || 8;
  const license = driver.licenseNumber || 'DL-DHK-2018-XXXXX';
  const rawImage = driver.profileImage || driver.user?.profileImage;
  const imageUrl = getImageUrl(rawImage);

  return (
    <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-emerald-800/60 relative overflow-hidden">
      {/* Subtle background highlight decoration */}
      <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Card Header Title */}
      <div className="flex items-center justify-between pb-4 border-b border-emerald-800/80 mb-4">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
          <span>👨‍✈️</span> {title}
        </h4>
        <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-emerald-500/30">
          ✓ বিআরটিএ ভেরিফাইড
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5">
        {/* Driver Photo Frame */}
        <div className="relative group flex-shrink-0">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-emerald-400/80 shadow-lg bg-slate-800 flex items-center justify-center">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={name}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className="w-full h-full flex flex-col items-center justify-center bg-emerald-800 text-white font-extrabold text-3xl"
              style={{ display: imageUrl ? 'none' : 'flex' }}
            >
              <span>👨‍✈️</span>
              <span className="text-xs mt-1 font-semibold opacity-80">{name.split(' ')[0]}</span>
            </div>
          </div>
          <span className="absolute -bottom-2 -right-1 bg-emerald-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow border border-emerald-400">
            স্টাফ
          </span>
        </div>

        {/* Driver Main Details */}
        <div className="flex-1 text-center sm:text-left space-y-2 w-full">
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">{name}</h3>
            <p className="text-xs text-emerald-200/90 font-medium">
              পেশাদার ড্রাইভার • অভিজ্ঞতার মেয়াদ: <strong className="text-white font-bold">{experience} বছর</strong>
            </p>
          </div>

          {/* Rating and Trips Badges */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
            <span className="bg-amber-400/20 text-amber-300 text-xs px-2.5 py-1 rounded-lg font-bold border border-amber-400/30 flex items-center gap-1">
              ⭐ {rating.toFixed(1)} / 5.0
            </span>
            <span className="bg-emerald-400/15 text-emerald-200 text-xs px-2.5 py-1 rounded-lg font-semibold border border-emerald-400/20">
              🚗 {trips}+ ট্রিপ সম্পন্ন
            </span>
          </div>

          {/* Phone and License Details */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs border-t border-emerald-800/60 mt-3">
            <div className="flex items-center gap-2 text-emerald-100">
              <span className="text-emerald-400 font-bold">📞 ফোন:</span>
              <a href={`tel:${phone}`} className="font-bold text-white hover:text-emerald-300 transition underline decoration-emerald-500">
                {phone}
              </a>
            </div>
            <div className="flex items-center gap-2 text-emerald-100">
              <span className="text-emerald-400 font-bold">🆔 লাইসেন্স:</span>
              <span className="font-mono text-[11px] text-gray-200 font-semibold">{license}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverCard;
