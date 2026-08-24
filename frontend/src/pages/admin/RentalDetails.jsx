import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import RentalStatusBadge from '../../components/rentals/RentalStatusBadge';
import rentalService from '../../services/rental.service';

const AdminRentalDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(location.state?.message || null);

  // Status Modal State
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Vehicle Return Modal State
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [actualReturnDate, setActualReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [endMileage, setEndMileage] = useState('');
  const [endFuelLevel, setEndFuelLevel] = useState(100);
  const [additionalCharges, setAdditionalCharges] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [damageReport, setDamageReport] = useState('');
  const [notes, setNotes] = useState('গাড়ি সপর্দ গ্রহণ করা হয়েছে এবং পরিদর্শনের পর রেন্টাল সম্পূর্ণ করা হয়েছে।');
  const [submittingReturn, setSubmittingReturn] = useState(false);

  const fetchRental = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await rentalService.getRentalById(id);
      if (response.success && response.data?.rental) {
        const r = response.data.rental;
        setRental(r);
        setSelectedStatus(r.status);
        setEndMileage(r.endMileage || r.startMileage + 150);
        setEndFuelLevel(r.endFuelLevel !== null && r.endFuelLevel !== undefined ? r.endFuelLevel : 100);
        setAdditionalCharges(r.additionalCharges || 0);
        setDiscount(r.discount || 0);
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

  const handleUpdateStatus = async () => {
    if (!rental || !selectedStatus) return;
    setUpdatingStatus(true);
    try {
      const res = await rentalService.updateRentalStatus(rental._id, selectedStatus);
      if (res.success) {
        setSuccessMsg('রেন্টাল স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে।');
        setStatusModalOpen(false);
        fetchRental();
      }
    } catch (err) {
      alert(err.message || 'স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleProcessReturn = async (e) => {
    e.preventDefault();
    if (!rental) return;

    setSubmittingReturn(true);
    try {
      const payload = {
        actualReturnDate,
        endMileage: Number(endMileage),
        endFuelLevel: Number(endFuelLevel),
        additionalCharges: Number(additionalCharges),
        discount: Number(discount),
        damageReport: damageReport.trim() || null,
        notes: notes.trim() || null,
      };

      const res = await rentalService.returnRental(rental._id, payload);
      if (res.success) {
        setSuccessMsg('গাড়ি সপর্দ গ্রহণ সম্পন্ন করা হয়েছে এবং গাড়িটি পুনরায় (Available) করা হয়েছে!');
        setReturnModalOpen(false);
        fetchRental();
      }
    } catch (err) {
      alert(err.message || 'গাড়ি সপর্দ গ্রহণ প্রক্রিয়ায় সমস্যা হয়েছে।');
    } finally {
      setSubmittingReturn(false);
    }
  };

  // Live calculation of final amount for modal
  const calculatedFinalAmount = rental
    ? rental.rentalAmount + Number(additionalCharges || 0) - Number(discount || 0)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            to="/admin/rentals"
            className="text-emerald-700 hover:text-emerald-800 text-sm font-semibold flex items-center gap-1"
          >
            ← এডমিন রেন্টাল তালিকায় ফিরে যান
          </Link>
        </div>

        {/* Success Banner */}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 mb-6 text-sm flex items-center justify-between">
            <span>✅ {successMsg}</span>
            <button onClick={() => setSuccessMsg(null)} className="font-bold">✖</button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-sm text-gray-600 mt-4 font-medium">রেন্টাল চুক্তি লোড হচ্ছে...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center my-6 shadow-sm">
            <span className="text-4xl">❌</span>
            <h3 className="text-xl font-bold text-red-700 mt-3">চুক্তি পাওয়া যায়নি</h3>
            <p className="text-sm text-gray-600 mt-1">{error}</p>
            <Link
              to="/admin/rentals"
              className="mt-5 inline-block px-6 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl"
            >
              রেন্টাল তালিকায় ফিরে যান
            </Link>
          </div>
        )}

        {/* Details Content */}
        {!loading && !error && rental && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
              <div>
                <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded">
                  রেন্টাল আইডি: #{rental.rentalId}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">সম্পূর্ণ রেন্টাল চুক্তি বিবরণ</h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  বুকিং রেফারেন্স: #{rental.booking?.bookingId || rental.booking || 'N/A'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <RentalStatusBadge status={rental.status} />

                <button
                  onClick={() => setStatusModalOpen(true)}
                  className="px-3.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded-xl transition"
                >
                  🔄 স্ট্যাটাস পরিবর্তন
                </button>

                {['active', 'scheduled', 'overdue'].includes(rental.status) && (
                  <button
                    onClick={() => setReturnModalOpen(true)}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition shadow flex items-center gap-1"
                  >
                    🚗 গাড়ি সপর্দ গ্রহণ (Return Car)
                  </button>
                )}
              </div>
            </div>

            {/* Customer, Car & Driver Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                <h4 className="font-bold text-gray-900 border-b pb-1">👤 কাস্টমার বিবরণ</h4>
                <p className="text-sm font-bold text-gray-900">{rental.customer?.fullName || rental.customer?.user?.name || 'গ্রাহক'}</p>
                <p className="text-gray-600">ফোন: {rental.customer?.phone || rental.customer?.user?.phone || 'N/A'}</p>
                <p className="text-gray-600">ইমেইল: {rental.customer?.email || rental.customer?.user?.email || 'N/A'}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                <h4 className="font-bold text-gray-900 border-b pb-1">🚗 গাড়ি বিবরণ</h4>
                <p className="text-sm font-bold text-gray-900">{rental.car?.name}</p>
                <p className="text-gray-600">{rental.car?.brand} {rental.car?.model} ({rental.car?.carType})</p>
                <p className="text-gray-600">রেজিস্ট্রেশন: <strong className="text-gray-800">{rental.car?.registrationNumber}</strong></p>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                <h4 className="font-bold text-gray-900 border-b pb-1">👨‍✈️ ড্রাইভার বিবরণ</h4>
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

            {/* Handover & Inspection Meter Box */}
            <div className="p-5 bg-blue-50/60 border border-blue-100 rounded-2xl space-y-3">
              <h3 className="text-sm font-bold text-blue-900 border-b border-blue-200 pb-2">
                🔍 মাইলপেজ ও ফুয়েল পরিদর্শন (Odometer & Fuel Level Inspection)
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

            {/* Financial & Schedule breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                <h4 className="font-bold text-gray-900 border-b pb-1">📅 সময়সূচী</h4>
                <div className="flex justify-between">
                  <span className="text-gray-600">শুরুর তারিখ:</span>
                  <strong className="text-gray-900">{new Date(rental.startDate).toLocaleDateString('bn-BD')}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">প্রত্যাশিত ফেরত:</span>
                  <strong className="text-gray-900">{new Date(rental.expectedReturnDate).toLocaleDateString('bn-BD')}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">প্রকৃত সপর্দ তারিখ:</span>
                  <strong className="text-gray-900">{rental.actualReturnDate ? new Date(rental.actualReturnDate).toLocaleDateString('bn-BD') : 'এখনও ফেরত দেওয়া হয়নি'}</strong>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-2">
                <h4 className="font-bold text-emerald-900 border-b border-emerald-200 pb-1">💰 ভাড়া ও চার্জ ব্রেকডাউন</h4>
                <div className="flex justify-between">
                  <span className="text-gray-600">মূল চুক্তি ভাড়া:</span>
                  <strong className="text-gray-900">৳{rental.rentalAmount?.toLocaleString('bn-BD')}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">অতিরিক্ত চার্জ (ক্ষতি/ফুয়েল/বিলম্ব):</span>
                  <strong className="text-gray-900">+৳{rental.additionalCharges?.toLocaleString('bn-BD')}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ছাড় / ডিসকাউন্ট:</span>
                  <strong className="text-gray-900">-৳{rental.discount?.toLocaleString('bn-BD')}</strong>
                </div>
                <div className="pt-2 border-t border-emerald-200 flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-900">সর্বমোট চূড়ান্ত হিসাব:</span>
                  <span className="text-2xl font-extrabold text-emerald-700">৳{rental.finalAmount?.toLocaleString('bn-BD')}</span>
                </div>
              </div>
            </div>

            {/* Damage report & notes */}
            {rental.damageReport && (
              <div className="text-xs bg-amber-50 border border-amber-200 p-4 rounded-2xl text-amber-900">
                <span className="font-bold block mb-1">⚠️ ক্ষয়ক্ষতি বিবরণ (Damage Report):</span>
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

        {/* Change Status Modal */}
        {statusModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">
                🔄 রেন্টাল স্ট্যাটাস পরিবর্তন
              </h3>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">নতুন স্ট্যাটাস</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-sm bg-white font-medium focus:ring-2 focus:ring-blue-500"
                >
                  <option value="scheduled">নির্ধারিত (scheduled)</option>
                  <option value="active">চলমান (active)</option>
                  <option value="completed">সম্পন্ন (completed)</option>
                  <option value="overdue">মেয়াদোত্তীর্ণ (overdue)</option>
                  <option value="cancelled">বাতিলকৃত (cancelled)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setStatusModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleUpdateStatus}
                  disabled={updatingStatus}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow disabled:opacity-50"
                >
                  {updatingStatus ? 'আপডেট হচ্ছে...' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Vehicle Return Modal */}
        {returnModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                🚗 গাড়ি সপর্দ গ্রহণ ফরম (Vehicle Return Form)
              </h3>

              <form onSubmit={handleProcessReturn} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">সপর্দ করার তারিখ</label>
                    <input
                      type="date"
                      required
                      value={actualReturnDate}
                      onChange={(e) => setActualReturnDate(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">ফেরতের সময় ওডোমিটার (km)</label>
                    <input
                      type="number"
                      required
                      min={rental.startMileage}
                      value={endMileage}
                      onChange={(e) => setEndMileage(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">ফেরতের সময় ফুয়েল (%)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="100"
                      value={endFuelLevel}
                      onChange={(e) => setEndFuelLevel(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">অতিরিক্ত ফি/চার্জ (৳)</label>
                    <input
                      type="number"
                      min="0"
                      value={additionalCharges}
                      onChange={(e) => setAdditionalCharges(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">ছাড় / ডিসকাউন্ট (৳)</label>
                    <input
                      type="number"
                      min="0"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-bold text-emerald-700"
                    />
                  </div>

                  {/* Calculated Final Box */}
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-center flex flex-col justify-center">
                    <span className="text-[11px] text-gray-600 block">হিসাবকৃত চূড়ান্ত মোট টাকা</span>
                    <strong className="text-xl font-extrabold text-emerald-700">
                      ৳{calculatedFinalAmount.toLocaleString('bn-BD')}
                    </strong>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ক্ষয়ক্ষতির রিপোর্ট (ঐচ্ছিক)</label>
                  <textarea
                    value={damageReport}
                    onChange={(e) => setDamageReport(e.target.value)}
                    rows="2"
                    placeholder="কোনো নতুন স্ক্র্যাচ বা ক্ষতি থাকলে বর্ণনা করুন..."
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">রিটার্ন নোট</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="2"
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setReturnModalOpen(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReturn}
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow disabled:opacity-50"
                  >
                    {submittingReturn ? 'সপর্দ সম্পন্ন হচ্ছে...' : 'গাড়ি সপর্দ সম্পন্ন করুন'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default AdminRentalDetails;
