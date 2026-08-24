import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import CarStatusBadge from '../../components/cars/CarStatusBadge';
import carService from '../../services/car.service';

const CAR_TYPE_LABELS = {
  sedan: 'সেডান (Sedan)',
  suv: 'এসইউভি (SUV)',
  hatchback: 'হ্যাচব্যাক (Hatchback)',
  microbus: 'মাইক্রোবাস (Microbus)',
  pickup: 'পিকআপ (Pickup)',
};

const FUEL_LABELS = {
  petrol: 'পেট্রোল',
  diesel: 'ডিজেল',
  octane: 'অকটেন',
  cng: 'সিএনজি',
  hybrid: 'হাইব্রিড',
  electric: 'ইলেকট্রিক',
};

const TRANSMISSION_LABELS = {
  manual: 'ম্যানুয়াল',
  automatic: 'অটোমেটিক',
};

const AdminCarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Status Change Modal State
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchCar = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await carService.getCarById(id);
      if (response.success && response.data?.car) {
        setCar(response.data.car);
        setSelectedStatus(response.data.car.status);
      } else {
        setError('গাড়ির বিবরণ পাওয়া যায়নি।');
      }
    } catch (err) {
      setError(err.message || 'গাড়ির বিবরণ লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCar();
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!car || !selectedStatus) return;
    setUpdatingStatus(true);
    try {
      const res = await carService.updateCarStatus(car._id, selectedStatus);
      if (res.success) {
        setStatusModalOpen(false);
        fetchCar();
      }
    } catch (err) {
      alert(err.message || 'স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeleteCar = async () => {
    if (!car) return;
    setDeleting(true);
    try {
      const res = await carService.deleteCar(car._id);
      if (res.success) {
        navigate('/admin/cars', {
          state: { message: `গাড়ি "${car.name}" সফলভাবে মুছে ফেলা হয়েছে।` },
        });
      }
    } catch (err) {
      alert(err.message || 'গাড়ি মুছতে সমস্যা হয়েছে।');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/admin/cars"
            className="text-emerald-700 hover:text-emerald-800 text-sm font-semibold flex items-center gap-1"
          >
            ← এডমিন গাড়ির তালিকায় ফিরে যান
          </Link>
        </div>

        {loading && (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
            <p className="text-sm text-gray-600 mt-4 font-medium">গাড়ির বিবরণ লোড হচ্ছে...</p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center my-8 shadow-sm">
            <span className="text-4xl">❌</span>
            <h3 className="text-xl font-bold text-red-700 mt-3">গাড়ি পাওয়া যায়নি</h3>
            <p className="text-sm text-gray-600 mt-1">{error}</p>
            <Link
              to="/admin/cars"
              className="mt-5 inline-block px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition"
            >
              গাড়ির তালিকায় ফিরে যান
            </Link>
          </div>
        )}

        {!loading && !error && car && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden p-6 lg:p-8 space-y-8">
            {/* Top Admin Action Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded">
                    {CAR_TYPE_LABELS[car.carType] || car.carType}
                  </span>
                  <CarStatusBadge status={car.status} />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{car.name}</h1>
                <p className="text-xs text-gray-500 mt-1">রেজিস্ট্রেশন: {car.registrationNumber}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setStatusModalOpen(true)}
                  className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded-xl transition"
                >
                  🔄 স্ট্যাটাস পরিবর্তন
                </button>
                <Link
                  to={`/admin/cars/${car._id}/edit`}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow"
                >
                  ✏️ এডিট করুন
                </Link>
                <button
                  onClick={() => setDeleteModalOpen(true)}
                  className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold rounded-xl transition"
                >
                  🗑️ ডিলিট
                </button>
              </div>
            </div>

            {/* Gallery and Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Image Preview */}
              <div className="lg:col-span-6 space-y-3">
                <div className="relative h-64 sm:h-80 bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
                  {car.images && car.images.length > 0 ? (
                    <img
                      src={car.images[activeImageIndex] || car.images[0]}
                      alt={car.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-emerald-50 text-emerald-800">
                      <span className="text-6xl">🚗</span>
                      <span className="text-xs font-semibold mt-2">{car.brand} {car.model}</span>
                    </div>
                  )}
                </div>

                {car.images && car.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {car.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-16 h-12 rounded-lg overflow-hidden border-2 ${
                          activeImageIndex === idx ? 'border-emerald-600' : 'border-transparent opacity-70'
                        }`}
                      >
                        <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Specifications */}
              <div className="lg:col-span-6 space-y-4">
                <h3 className="text-base font-bold text-gray-900 border-b pb-2">📊 সম্পূর্ণ টেকনিক্যাল স্পেসিফিকেশন</h3>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <span className="text-gray-500 block">ব্র্যান্ড</span>
                    <strong className="text-gray-900 text-sm">{car.brand}</strong>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <span className="text-gray-500 block">মডেল</span>
                    <strong className="text-gray-900 text-sm">{car.model}</strong>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <span className="text-gray-500 block">তৈরির সাল</span>
                    <strong className="text-gray-900 text-sm">{car.year}</strong>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <span className="text-gray-500 block">দৈনিক ভাড়া</span>
                    <strong className="text-emerald-600 text-sm">৳{car.dailyRentalPrice?.toLocaleString('bn-BD')}</strong>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <span className="text-gray-500 block">গিয়ার টাইপ</span>
                    <strong className="text-gray-900 text-sm">{TRANSMISSION_LABELS[car.transmission] || car.transmission}</strong>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <span className="text-gray-500 block">ফুয়েল টাইপ</span>
                    <strong className="text-gray-900 text-sm">{FUEL_LABELS[car.fuelType] || car.fuelType}</strong>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <span className="text-gray-500 block">আসন সংখ্যা</span>
                    <strong className="text-gray-900 text-sm">{car.seatingCapacity} জন</strong>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <span className="text-gray-500 block">বর্তমান মাইলেজ</span>
                    <strong className="text-gray-900 text-sm">{car.currentMileage || 0} কিমি</strong>
                  </div>
                </div>

                {/* Driver */}
                {car.assignedDriver && (
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <h4 className="text-xs font-bold text-emerald-800 mb-1">👨‍✈️ অ্যাসাইনকৃত ড্রাইভার</h4>
                    <p className="text-sm font-bold text-gray-900">{car.assignedDriver.name || 'ড্রাইভার'}</p>
                    {car.assignedDriver.phone && (
                      <p className="text-xs text-gray-600">ফোন: {car.assignedDriver.phone}</p>
                    )}
                  </div>
                )}

                {/* Description */}
                <div>
                  <h4 className="text-xs font-bold text-gray-700 mb-1">বিবরণ</h4>
                  <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl">
                    {car.description || 'কোনো বিবরণ যোগ করা হয়নি।'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Change Status Modal */}
        {statusModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">
                🔄 গাড়ির স্ট্যাটাস পরিবর্তন
              </h3>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">নতুন স্ট্যাটাস নির্বাচন করুন</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-sm bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="available">উপলব্ধ (available)</option>
                  <option value="rented">ভাড়ায় আছে (rented)</option>
                  <option value="reserved">সংরক্ষিত (reserved)</option>
                  <option value="maintenance">রক্ষণাবেক্ষণে (maintenance)</option>
                  <option value="inactive">নিষ্ক্রিয় (inactive)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setStatusModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleUpdateStatus}
                  disabled={updatingStatus}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow disabled:opacity-50"
                >
                  {updatingStatus ? 'আপডেট হচ্ছে...' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
              <div className="text-center">
                <span className="text-4xl">⚠️</span>
                <h3 className="text-lg font-bold text-red-700 mt-2">গাড়িটি মুছে ফেলতে নিশ্চিত?</h3>
                <p className="text-xs text-gray-600 mt-1">
                  আপনি গাড়ি <strong>"{car?.name}"</strong> ({car?.registrationNumber}) মুছে ফেলতে যাচ্ছেন।
                </p>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl"
                >
                  বাতিল করুন
                </button>
                <button
                  onClick={handleDeleteCar}
                  disabled={deleting}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow disabled:opacity-50"
                >
                  {deleting ? 'মুছে ফেলা হচ্ছে...' : 'হ্যাঁ, ডিলিট করুন'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default AdminCarDetails;
