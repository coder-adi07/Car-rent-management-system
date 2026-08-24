import React, { useState, useEffect } from 'react';
import { getImageUrl } from '../../utils/imageUrl';

const CAR_TYPES = [
  { value: 'sedan', label: 'সেডান (Sedan)' },
  { value: 'suv', label: 'এসইউভি (SUV)' },
  { value: 'hatchback', label: 'হ্যাচব্যাক (Hatchback)' },
  { value: 'microbus', label: 'মাইক্রোবাস (Microbus)' },
  { value: 'pickup', label: 'পিকআপ (Pickup)' },
];

const FUEL_TYPES = [
  { value: 'petrol', label: 'পেট্রোল (Petrol)' },
  { value: 'diesel', label: 'ডিজেল (Diesel)' },
  { value: 'octane', label: 'অকটেন (Octane)' },
  { value: 'cng', label: 'সিএনজি (CNG)' },
  { value: 'hybrid', label: 'হাইব্রিড (Hybrid)' },
  { value: 'electric', label: 'ইলেকট্রিক (Electric)' },
];

const TRANSMISSIONS = [
  { value: 'automatic', label: 'অটোমেটিক (Automatic)' },
  { value: 'manual', label: 'ম্যানুয়াল (Manual)' },
];

const STATUSES = [
  { value: 'available', label: 'উপলব্ধ (Available)' },
  { value: 'rented', label: 'ভাড়ায় আছে (Rented)' },
  { value: 'reserved', label: 'সংরক্ষিত (Reserved)' },
  { value: 'maintenance', label: 'রক্ষণাবেক্ষণে (Maintenance)' },
  { value: 'inactive', label: 'নিষ্ক্রিয় (Inactive)' },
];

const CarForm = ({ initialValues = {}, onSubmit, isLoading = false, isEdit = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    registrationNumber: '',
    carType: 'sedan',
    year: new Date().getFullYear(),
    seatingCapacity: 4,
    fuelType: 'petrol',
    transmission: 'automatic',
    dailyRentalPrice: '',
    description: '',
    status: 'available',
    currentMileage: 0,
  });

  const [imagesList, setImagesList] = useState([]);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      setFormData({
        name: initialValues.name || '',
        brand: initialValues.brand || '',
        model: initialValues.model || '',
        registrationNumber: initialValues.registrationNumber || '',
        carType: initialValues.carType || 'sedan',
        year: initialValues.year || new Date().getFullYear(),
        seatingCapacity: initialValues.seatingCapacity || 4,
        fuelType: initialValues.fuelType || 'petrol',
        transmission: initialValues.transmission || 'automatic',
        dailyRentalPrice: initialValues.dailyRentalPrice || '',
        description: initialValues.description || '',
        status: initialValues.status || 'available',
        currentMileage: initialValues.currentMileage || 0,
      });

      if (initialValues.images && Array.isArray(initialValues.images)) {
        setImagesList(initialValues.images);
      }
    }
  }, [initialValues]);

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'গাড়ির নাম দেওয়া আবশ্যক।';
    if (!formData.brand.trim()) newErrors.brand = 'ব্র্যান্ড এর নাম দেওয়া আবশ্যক।';
    if (!formData.model.trim()) newErrors.model = 'মডেল দেওয়া আবশ্যক।';
    if (!formData.registrationNumber.trim()) newErrors.registrationNumber = 'রেজিস্ট্রেশন নম্বর দেওয়া আবশ্যক।';
    if (!formData.dailyRentalPrice || Number(formData.dailyRentalPrice) <= 0) {
      newErrors.dailyRentalPrice = 'দৈনিক ভাড়া অবশ্যই ০ এর চেয়ে বেশি হতে হবে।';
    }
    if (!formData.year || Number(formData.year) < 1900 || Number(formData.year) > new Date().getFullYear() + 1) {
      newErrors.year = 'সঠিক সাল প্রদান করুন।';
    }
    if (!formData.seatingCapacity || Number(formData.seatingCapacity) < 1) {
      newErrors.seatingCapacity = 'আসন সংখ্যা সর্বনিম্ন ১ হতে হবে।';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Multiple File Upload Handler with Canvas Compression
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1024;
          const MAX_HEIGHT = 768;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setImagesList((prev) => [...prev, compressedDataUrl]);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddCustomUrl = () => {
    if (customUrlInput.trim()) {
      const urls = customUrlInput
        .split(',')
        .map((u) => u.trim())
        .filter((u) => u.length > 0);
      setImagesList((prev) => [...prev, ...urls]);
      setCustomUrlInput('');
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setImagesList((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: formData.name.trim(),
      brand: formData.brand.trim(),
      model: formData.model.trim(),
      registrationNumber: formData.registrationNumber.trim().toUpperCase(),
      carType: formData.carType,
      year: Number(formData.year),
      seatingCapacity: Number(formData.seatingCapacity),
      fuelType: formData.fuelType,
      transmission: formData.transmission,
      dailyRentalPrice: Number(formData.dailyRentalPrice),
      images: imagesList,
      description: formData.description.trim() || null,
      status: formData.status,
      currentMileage: Number(formData.currentMileage) || 0,
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
      <div className="border-b border-gray-100 pb-4">
        <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
          <span>{isEdit ? '✏️' : '➕'}</span>
          <span>{isEdit ? 'গাড়ির তথ্য সংশোধন করুন' : 'নতুন গাড়ি যোগ করুন (Add New Car)'}</span>
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          গাড়ির সকল স্পেসিফিকেশন, দৈনিক ভাড়া, তথ্য ও ছবি যুক্ত করুন।
        </p>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">গাড়ির নাম *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="যেমন: Toyota Premio F 2020"
            className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 ${
              errors.name ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-emerald-500'
            }`}
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">ব্র্যান্ড *</label>
          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            placeholder="যেমন: Toyota / Honda / Hyundai"
            className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 ${
              errors.brand ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-emerald-500'
            }`}
          />
          {errors.brand && <p className="text-xs text-red-500 mt-1">{errors.brand}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">মডেল *</label>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleChange}
            placeholder="যেমন: Premio / Axio / Noah"
            className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 ${
              errors.model ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-emerald-500'
            }`}
          />
          {errors.model && <p className="text-xs text-red-500 mt-1">{errors.model}</p>}
        </div>
      </div>

      {/* Reg, Type, Year */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">রেজিস্ট্রেশন নম্বর *</label>
          <input
            type="text"
            name="registrationNumber"
            value={formData.registrationNumber}
            onChange={handleChange}
            placeholder="যেমন: DHAKA-METRO-GA-12-3456"
            className={`w-full px-3.5 py-2.5 border rounded-xl text-sm font-mono uppercase focus:outline-none focus:ring-2 ${
              errors.registrationNumber ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-emerald-500'
            }`}
          />
          {errors.registrationNumber && <p className="text-xs text-red-500 mt-1">{errors.registrationNumber}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">গাড়ির টাইপ *</label>
          <select
            name="carType"
            value={formData.carType}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {CAR_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">তৈরির সাল *</label>
          <input
            type="number"
            name="year"
            value={formData.year}
            onChange={handleChange}
            className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 ${
              errors.year ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-emerald-500'
            }`}
          />
          {errors.year && <p className="text-xs text-red-500 mt-1">{errors.year}</p>}
        </div>
      </div>

      {/* Specs & Pricing */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">আসন সংখ্যা *</label>
          <input
            type="number"
            name="seatingCapacity"
            value={formData.seatingCapacity}
            onChange={handleChange}
            min="1"
            className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 ${
              errors.seatingCapacity ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-emerald-500'
            }`}
          />
          {errors.seatingCapacity && <p className="text-xs text-red-500 mt-1">{errors.seatingCapacity}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">ফুয়েল টাইপ *</label>
          <select
            name="fuelType"
            value={formData.fuelType}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {FUEL_TYPES.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">ট্রান্সমিশন *</label>
          <select
            name="transmission"
            value={formData.transmission}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {TRANSMISSIONS.map((tr) => (
              <option key={tr.value} value={tr.value}>
                {tr.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">দৈনিক ভাড়া (৳) *</label>
          <input
            type="number"
            name="dailyRentalPrice"
            value={formData.dailyRentalPrice}
            onChange={handleChange}
            placeholder="যেমন: ৩৫০০"
            className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 ${
              errors.dailyRentalPrice ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-emerald-500'
            }`}
          />
          {errors.dailyRentalPrice && <p className="text-xs text-red-500 mt-1">{errors.dailyRentalPrice}</p>}
        </div>
      </div>

      {/* Status & Mileage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">স্ট্যাটাস</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">বর্তমান মাইলেজ (কিমি)</label>
          <input
            type="number"
            name="currentMileage"
            value={formData.currentMileage}
            onChange={handleChange}
            min="0"
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Car Photos Upload & URL Section */}
      <div className="p-5 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
          <span>🖼️</span> গাড়ির ছবি যুক্তকরণ (Car Photos)
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              ১. ডিভাইস থেকে ছবি আপলোড করুন (Upload Image Files):
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="block w-full text-xs text-gray-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              ২. অথবা সরাসরি ইমেজের URL লিংক টাইপ করুন:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                placeholder="যেমন: /uploads/cars/car_01.jpg অথবা https://..."
                className="flex-1 px-3.5 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 bg-white"
              />
              <button
                type="button"
                onClick={handleAddCustomUrl}
                className="px-4 py-2 bg-emerald-700 text-white font-bold text-xs rounded-xl hover:bg-emerald-800 transition"
              >
                + যোগ করুন
              </button>
            </div>
          </div>
        </div>

        {/* Uploaded Image Previews */}
        {imagesList.length > 0 && (
          <div className="pt-2 border-t border-emerald-200 space-y-2">
            <span className="text-xs font-bold text-emerald-800 block">
              যুক্ত করা ছবিসমূহ ({imagesList.length} টি):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {imagesList.map((imgSrc, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden border border-emerald-300 aspect-video bg-gray-100 shadow-sm">
                  <img
                    src={getImageUrl(imgSrc) || imgSrc}
                    alt={`Car preview ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow hover:bg-red-700 transition"
                    title="ছবি মুছে ফেলুন"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">গাড়ির বিস্তারিত বিবরণ (Description)</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          placeholder="গাড়িটির বৈশিষ্ট্য, এসি, বসার সুবিধা, কন্ডিশন ও বিস্তারিত তথ্য..."
          className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        ></textarea>
      </div>

      {/* Submit Buttons */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100">
        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-sm transition shadow-md flex items-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>সংরক্ষণ হচ্ছে...</span>
            </>
          ) : (
            <span>💾 {isEdit ? 'গাড়ির তথ্য আপডেট করুন' : 'নতুন গাড়ি সংরক্ষণ করুন'}</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default CarForm;
