import React, { useState, useEffect } from 'react';
import DriverCard from '../drivers/DriverCard';

const BookingForm = ({ car, onSubmit, isLoading = false }) => {
  const today = new Date().toISOString().split('T')[0];
  const tomorrowDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    startDate: today,
    endDate: tomorrowDate,
    pickupAddress: '',
    pickupCity: 'ঢাকা',
    pickupDistrict: 'ঢাকা',
    dropoffAddress: '',
    dropoffCity: 'ঢাকা',
    dropoffDistrict: 'ঢাকা',
    driverRequired: true,
    specialRequest: '',
  });

  const [errors, setErrors] = useState({});
  const [calculation, setCalculation] = useState({ rentalDays: 1, totalAmount: car?.dailyRentalPrice || 3500 });

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start <= end) {
        const diffTime = Math.abs(end - start);
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
        const rate = car?.dailyRentalPrice || 3500;
        setCalculation({
          rentalDays: days,
          totalAmount: days * rate,
        });
      }
    }
  }, [formData.startDate, formData.endDate, car]);

  const validate = () => {
    const newErrors = {};

    if (!formData.startDate) newErrors.startDate = 'ভ্রমণ শুরুর তারিখ আবশ্যক।';
    if (!formData.endDate) newErrors.endDate = 'ভ্রমণ সমাপ্তির তারিখ আবশ্যক।';

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (start > end) {
        newErrors.endDate = 'সমাপ্তির তারিখ অবশ্যই শুরুর তারিখের পর বা সমান হতে হবে।';
      }
    }

    if (!formData.pickupAddress.trim()) {
      newErrors.pickupAddress = 'পিকআপ ঠিকানা প্রদান করা আবশ্যক।';
    }

    if (!formData.dropoffAddress.trim()) {
      newErrors.dropoffAddress = 'ড্রপঅফ ঠিকানা প্রদান করা আবশ্যক।';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      carId: car._id,
      startDate: formData.startDate,
      endDate: formData.endDate,
      pickupLocation: {
        address: formData.pickupAddress.trim(),
        city: formData.pickupCity.trim() || 'ঢাকা',
        district: formData.pickupDistrict.trim() || 'ঢাকা',
      },
      dropoffLocation: {
        address: formData.dropoffAddress.trim(),
        city: formData.dropoffCity.trim() || 'ঢাকা',
        district: formData.dropoffDistrict.trim() || 'ঢাকা',
      },
      driverRequired: formData.driverRequired,
      specialRequest: formData.specialRequest.trim() || null,
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Selected Car Info Header */}
      <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
        <div className="w-16 h-16 rounded-xl bg-white border border-emerald-200 overflow-hidden flex items-center justify-center text-3xl flex-shrink-0">
          {car?.images && car.images.length > 0 ? (
            <img src={car.images[0]} alt={car.name} className="w-full h-full object-cover" />
          ) : (
            '🚗'
          )}
        </div>
        <div className="flex-1">
          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded uppercase">
            {car?.carType}
          </span>
          <h3 className="text-lg font-bold text-gray-900 mt-0.5">{car?.name}</h3>
          <p className="text-xs text-gray-600">
            {car?.brand} {car?.model} ({car?.registrationNumber}) • ৳{car?.dailyRentalPrice?.toLocaleString('bn-BD')}/দিন
          </p>
        </div>
      </div>

      {/* Driver Information Card (Visible during booking) */}
      <DriverCard driver={car?.assignedDriver} title="👨‍✈️ আপনার গাড়ির ড্রাইভারের ছবি ও প্রোফাইল" />

      {/* Dates Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">ভ্রমণ শুরুর তারিখ *</label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            min={today}
            className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 ${
              errors.startDate ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-emerald-500'
            }`}
          />
          {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">ভ্রমণ সমাপ্তির তারিখ *</label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            min={formData.startDate || today}
            className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 ${
              errors.endDate ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-emerald-500'
            }`}
          />
          {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>}
        </div>
      </div>

      {/* Pickup Location */}
      <div className="space-y-2 pt-2 border-t border-gray-100">
        <h4 className="text-xs font-bold text-gray-800">📍 পিকআপ লোকেশন</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <input
              type="text"
              name="pickupAddress"
              value={formData.pickupAddress}
              onChange={handleChange}
              placeholder="ঠিকানা (যেমন: হাউস ১২, রোড ৫, ধানমন্ডি)"
              className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 ${
                errors.pickupAddress ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-emerald-500'
              }`}
            />
            {errors.pickupAddress && <p className="text-xs text-red-500 mt-1">{errors.pickupAddress}</p>}
          </div>
          <div>
            <input
              type="text"
              name="pickupCity"
              value={formData.pickupCity}
              onChange={handleChange}
              placeholder="শহর (যেমন: ঢাকা)"
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Dropoff Location */}
      <div className="space-y-2 pt-2 border-t border-gray-100">
        <h4 className="text-xs font-bold text-gray-800">🚩 ড্রপঅফ লোকেশন</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <input
              type="text"
              name="dropoffAddress"
              value={formData.dropoffAddress}
              onChange={handleChange}
              placeholder="ঠিকানা (যেমন: বিমানবন্দর টার্মিনাল ২, ঢাকা)"
              className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 ${
                errors.dropoffAddress ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-emerald-500'
              }`}
            />
            {errors.dropoffAddress && <p className="text-xs text-red-500 mt-1">{errors.dropoffAddress}</p>}
          </div>
          <div>
            <input
              type="text"
              name="dropoffCity"
              value={formData.dropoffCity}
              onChange={handleChange}
              placeholder="শহর (যেমন: ঢাকা)"
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Driver Requirement & Special Notes */}
      <div className="space-y-3 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="driverRequired"
            name="driverRequired"
            checked={formData.driverRequired}
            onChange={handleChange}
            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 rounded"
          />
          <label htmlFor="driverRequired" className="text-xs font-bold text-gray-800 cursor-pointer">
            👨‍✈️ অভিজ্ঞ ড্রাইভার প্রয়োজন (Recommended)
          </label>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">অতিরিক্ত নোট / বিশেষ অনুরোধ (ঐচ্ছিক)</label>
          <textarea
            name="specialRequest"
            value={formData.specialRequest}
            onChange={handleChange}
            rows="2"
            placeholder="পিকআপ টাইমিং বা অন্যান্য তথ্য..."
            className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          ></textarea>
        </div>
      </div>

      {/* Price Summary Calculation Card */}
      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
        <div className="flex justify-between text-xs text-gray-600">
          <span>দৈনিক ভাড়া:</span>
          <span className="font-semibold text-gray-900">৳{car?.dailyRentalPrice?.toLocaleString('bn-BD')}</span>
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>মোট দিন (Duration):</span>
          <span className="font-semibold text-gray-900">{calculation.rentalDays} দিন</span>
        </div>
        <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
          <span className="text-sm font-bold text-gray-900">আনুমানিক মোট খরচ:</span>
          <span className="text-2xl font-extrabold text-emerald-600">
            ৳{calculation.totalAmount.toLocaleString('bn-BD')}
          </span>
        </div>
      </div>

      {/* Submit Action */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base rounded-2xl transition shadow flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>বুকিং প্রসেস হচ্ছে...</span>
          </>
        ) : (
          <span>🚀 বুকিং নিশ্চিত করুন (Confirm Booking)</span>
        )}
      </button>
    </form>
  );
};

export default BookingForm;
