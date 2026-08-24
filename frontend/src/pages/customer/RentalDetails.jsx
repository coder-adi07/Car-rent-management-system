import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import RentalStatusBadge from '../../components/rentals/RentalStatusBadge';
import rentalService from '../../services/rental.service';

const CustomerRentalDetails = () => {
  const { id } = useParams();
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRental = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await rentalService.getRentalById(id);
      if (response.success && response.data?.rental) {
        setRental(response.data.rental);
      } else {
        setError('রেন্টাল চুক্তি পাওয়া যায়নি।');
      }
    } catch (err) {
      setError(err.message || 'রেন্টাল বিবরণ লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRental();
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            to="/customer/rentals"
            className="text-emerald-700 hover:text-emerald-800 text-sm font-semibold flex items-center gap-1"
          >
            ← আমার রেন্টাল তালিকায় ফিরে যান
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-sm text-gray-600 mt-4 font-medium">রেন্টাল চুক্তি বিবরণ লোড হচ্ছে...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center my-6 shadow-sm">
            <span className="text-4xl">❌</span>
            <h3 className="text-xl font-bold text-red-700 mt-3">চুক্তি পাওয়া যায়নি</h3>
            <p className="text-sm text-gray-600 mt-1">{error}</p>
            <Link
              to="/customer/rentals"
              className="mt-5 inline-block px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl"
            >
              রেন্টাল তালিকায় ফিরে যান
            </Link>
          </div>
        )}

        {/* Rental Details Content */}
        {!loading && !error && rental && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
              <div>
                <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded">
                  রেন্টাল আইডি: #{rental.rentalId}
                </span>
                <h1 className="text-2xl font-extrabold text-gray-900 mt-1">কার রেন্টাল চুক্তিপত্র</h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  বুকিং সংলগ্ন আইডি: #{rental.booking?.bookingId || rental.booking || 'N/A'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <RentalStatusBadge status={rental.status} />

                {rental.status === 'completed' && (
                  <Link
                    to={`/customer/reviews/new?bookingId=${rental.booking?._id || rental.booking}`}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition shadow flex items-center gap-1"
                  >
                    ⭐ রিভিউ লিখুন
                  </Link>
                )}
              </div>
            </div>

            {/* Car & Driver Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                <h4 className="font-bold text-gray-900 border-b pb-1">🚗 গাড়ির তথ্য</h4>
                <p className="text-sm font-bold text-gray-900">{rental.car?.name}</p>
                <p className="text-gray-600">{rental.car?.brand} {rental.car?.model} ({rental.car?.carType})</p>
                <p className="text-gray-600">রেজিস্ট্রেশন: <strong className="text-gray-800">{rental.car?.registrationNumber}</strong></p>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                <h4 className="font-bold text-gray-900 border-b pb-1">👨‍✈️ ড্রাইভার তথ্য</h4>
                {rental.driver ? (
                  <>
                    <p className="text-sm font-bold text-gray-900">{rental.driver.fullName || rental.driver.user?.name}</p>
                    <p className="text-gray-600">ফোন: {rental.driver.phone || rental.driver.user?.phone}</p>
                    <p className="text-gray-600">লাইসেন্স: {rental.driver.licenseNumber}</p>
                  </>
                ) : (
                  <p className="text-gray-500 italic">সহ-ড্রাইভার ছাড়া (Self Drive)</p>
                )}
              </div>
            </div>

            {/* Mileage & Fuel Inspection */}
            <div className="p-5 bg-blue-50/60 border border-blue-100 rounded-2xl space-y-3">
              <h3 className="text-sm font-bold text-blue-900 border-b border-blue-200 pb-2 flex items-center gap-2">
                🔍 গাড়ি হ্যান্ডওভার ও সপর্দ পরিমাপ (Handover & Return Inspection)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-center">
                <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm">
                  <span className="text-gray-500 block">শুরুর মাইলপেজ</span>
                  <strong className="text-gray-900 text-sm">{rental.startMileage} km</strong>
                </div>
                <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm">
                  <span className="text-gray-500 block">ফেরতের মাইলপেজ</span>
                  <strong className="text-gray-900 text-sm">{rental.endMileage ? `${rental.endMileage} km` : 'চলমান...'}</strong>
                </div>
                <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm">
                  <span className="text-gray-500 block">শুরুর ফুয়েল</span>
                  <strong className="text-gray-900 text-sm">{rental.startFuelLevel}%</strong>
                </div>
                <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm">
                  <span className="text-gray-500 block">ফেরতের ফুয়েল</span>
                  <strong className="text-gray-900 text-sm">{rental.endFuelLevel !== null && rental.endFuelLevel !== undefined ? `${rental.endFuelLevel}%` : 'চলমান...'}</strong>
                </div>
              </div>
            </div>

            {/* Schedule & Financial Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                <h4 className="font-bold text-gray-900 border-b pb-1">📅 সময়কাল</h4>
                <div className="flex justify-between">
                  <span className="text-gray-600">শুরুর তারিখ:</span>
                  <strong className="text-gray-900">{new Date(rental.startDate).toLocaleDateString('bn-BD')}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">প্রত্যাশিত ফেরত:</span>
                  <strong className="text-gray-900">{new Date(rental.expectedReturnDate).toLocaleDateString('bn-BD')}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">প্রকৃত ফেরতের তারিখ:</span>
                  <strong className="text-gray-900">{rental.actualReturnDate ? new Date(rental.actualReturnDate).toLocaleDateString('bn-BD') : 'এখনও ফেরত দেওয়া হয়নি'}</strong>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-2">
                <h4 className="font-bold text-emerald-900 border-b border-emerald-200 pb-1">💰 চূড়ান্ত হিসেব</h4>
                <div className="flex justify-between">
                  <span className="text-gray-600">মূল ভাড়া:</span>
                  <strong className="text-gray-900">৳{rental.rentalAmount?.toLocaleString('bn-BD')}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">অতিরিক্ত চার্জ:</span>
                  <strong className="text-gray-900">+৳{rental.additionalCharges?.toLocaleString('bn-BD')}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ডিসকাউন্ট:</span>
                  <strong className="text-gray-900">-৳{rental.discount?.toLocaleString('bn-BD')}</strong>
                </div>
                <div className="pt-2 border-t border-emerald-200 flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-900">সর্বমোট দেওয়া মূল্য:</span>
                  <span className="text-2xl font-extrabold text-emerald-700">৳{rental.finalAmount?.toLocaleString('bn-BD')}</span>
                </div>
              </div>
            </div>

            {/* Damage Report / Notes */}
            {rental.damageReport && (
              <div className="text-xs bg-amber-50 border border-amber-200 p-4 rounded-2xl text-amber-900">
                <span className="font-bold block mb-1">⚠️ গাড়ি ক্ষয়ক্ষতি / ড্যামেজ রিপোর্ট:</span>
                <p>{rental.damageReport}</p>
              </div>
            )}

            {rental.notes && (
              <div className="text-xs bg-gray-50 p-4 rounded-2xl">
                <span className="font-bold text-gray-800 block mb-1">রেন্টাল নোট:</span>
                <p className="text-gray-600">{rental.notes}</p>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CustomerRentalDetails;
