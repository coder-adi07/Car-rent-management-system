import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import CarStatusBadge from '../../components/cars/CarStatusBadge';
import CarFilter from '../../components/cars/CarFilter';
import carService from '../../services/car.service';
import { getImageUrl } from '../../utils/imageUrl';

const AdminCars = () => {
  const [cars, setCars] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({
    search: '',
    carType: '',
    status: '',
    minPrice: '',
    maxPrice: '',
    page: 1,
    limit: 10,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Status Change Modal State
  const [statusModalCar, setStatusModalCar] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Delete Modal State
  const [deleteModalCar, setDeleteModalCar] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCars = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await carService.getAllCars(filters);
      if (response.success && response.data) {
        setCars(response.data.cars || []);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      }
    } catch (err) {
      setError(err.message || 'গাড়ির তালিকা লোড করতে ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      carType: '',
      status: '',
      minPrice: '',
      maxPrice: '',
      page: 1,
      limit: 10,
    });
  };

  // Status Update Handler
  const handleOpenStatusModal = (car) => {
    setStatusModalCar(car);
    setSelectedStatus(car.status);
  };

  const handleUpdateStatus = async () => {
    if (!statusModalCar || !selectedStatus) return;
    setUpdatingStatus(true);
    try {
      const res = await carService.updateCarStatus(statusModalCar._id, selectedStatus);
      if (res.success) {
        setSuccessMsg(`গাড়ি "${statusModalCar.name}" এর স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে।`);
        setStatusModalCar(null);
        fetchCars();
      }
    } catch (err) {
      alert(err.message || 'স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Delete Handler
  const handleDeleteCar = async () => {
    if (!deleteModalCar) return;
    setDeleting(true);
    try {
      const res = await carService.deleteCar(deleteModalCar._id);
      if (res.success) {
        setSuccessMsg(`গাড়ি "${deleteModalCar.name}" সফলভাবে মুছে ফেলা হয়েছে।`);
        setDeleteModalCar(null);
        fetchCars();
      }
    } catch (err) {
      alert(err.message || 'গাড়ি মুছতে সমস্যা হয়েছে।');
    } finally {
      setDeleting(false);
    }
  };

  // Summary Metrics
  const totalAvailable = cars.filter((c) => c.status === 'available').length;
  const totalRented = cars.filter((c) => c.status === 'rented').length;
  const totalMaintenance = cars.filter((c) => c.status === 'maintenance').length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title Bar & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              🛠️ এডমিন কার ম্যানেজমেন্ট (Car Management)
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              গাড়ি যুক্ত করুন, তথ্য পরিবর্তন করুন, স্ট্যাটাস আপডেট বা গাড়ি মুছে ফেলুন।
            </p>
          </div>

          <Link
            to="/admin/cars/add"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition shadow flex items-center justify-center gap-2 self-start sm:self-auto"
          >
            ➕ নতুন গাড়ি যুক্ত করুন
          </Link>
        </div>

        {/* Success Alert Banner */}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 mb-6 text-sm flex items-center justify-between">
            <span>✅ {successMsg}</span>
            <button
              onClick={() => setSuccessMsg(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold"
            >
              ✖
            </button>
          </div>
        )}

        {/* Summary Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-xs font-semibold text-gray-500 block">মোট গাড়ি</span>
            <span className="text-2xl font-extrabold text-gray-900 mt-1 block">{pagination.total}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-xs font-semibold text-gray-500 block">উপলব্ধ (Available)</span>
            <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">{totalAvailable}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-xs font-semibold text-gray-500 block">ভাড়ায় (Rented)</span>
            <span className="text-2xl font-extrabold text-blue-600 mt-1 block">{totalRented}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-xs font-semibold text-gray-500 block">রক্ষণাবেক্ষণে (Maintenance)</span>
            <span className="text-2xl font-extrabold text-amber-600 mt-1 block">{totalMaintenance}</span>
          </div>
        </div>

        {/* Filter Section */}
        <CarFilter
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          showStatusFilter={true}
        />

        {/* Loading State */}
        {loading && (
          <div className="py-16 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
            <p className="text-sm text-gray-600 mt-4 font-medium">গাড়ির তালিকা লোড হচ্ছে...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center my-6">
            <span className="text-3xl">⚠️</span>
            <h3 className="text-lg font-bold text-red-800 mt-2">ত্রুটি ঘটেছে</h3>
            <p className="text-sm text-red-600 mt-1">{error}</p>
            <button
              onClick={fetchCars}
              className="mt-4 px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition"
            >
              পুনরায় চেষ্টা করুন (Retry)
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && cars.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center my-6">
            <span className="text-4xl">🚗</span>
            <h3 className="text-xl font-bold text-gray-800 mt-3">কোনো গাড়ি পাওয়া যায়নি</h3>
            <p className="text-sm text-gray-500 mt-1">
              বর্তমান ফিল্টারে কোনো ডাটা নেই অথবা এখনও কোনো গাড়ি যুক্ত করা হয়নি।
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                ফিল্টার রিক্লিয়ার করুন
              </button>
              <Link
                to="/admin/cars/add"
                className="px-5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 shadow"
              >
                ➕ নতুন গাড়ি যুক্ত করুন
              </Link>
            </div>
          </div>
        )}

        {/* Admin Cars Table */}
        {!loading && !error && cars.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">গাড়ি ও রেজিস্ট্রেশন</th>
                    <th className="px-4 py-3">ব্র্যান্ড ও মডেল</th>
                    <th className="px-4 py-3">টাইপ / সাল</th>
                    <th className="px-4 py-3">দৈনিক ভাড়া</th>
                    <th className="px-4 py-3">স্ট্যাটাস</th>
                    <th className="px-4 py-3 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {cars.map((car) => (
                    <tr key={car._id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center text-lg">
                            {car.images && car.images.length > 0 ? (
                              <img src={getImageUrl(car.images[0])} alt={car.name} className="w-full h-full object-cover" />
                            ) : (
                              '🚗'
                            )}
                          </div>
                          <div>
                            <Link
                              to={`/admin/cars/${car._id}`}
                              className="font-bold text-gray-900 hover:text-emerald-600"
                            >
                              {car.name}
                            </Link>
                            <span className="block text-xs text-gray-500">{car.registrationNumber}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="font-semibold text-gray-800">{car.brand}</span>
                        <span className="block text-xs text-gray-500">{car.model}</span>
                      </td>

                      <td className="px-4 py-3 text-xs text-gray-600">
                        <span className="font-semibold capitalize text-gray-800">{car.carType}</span>
                        <span className="block text-gray-400">সাল: {car.year}</span>
                      </td>

                      <td className="px-4 py-3 font-bold text-emerald-600 text-base">
                        ৳{car.dailyRentalPrice?.toLocaleString('bn-BD')}
                        <span className="text-xs text-gray-400 font-normal"> / দিন</span>
                      </td>

                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleOpenStatusModal(car)}
                          title="স্ট্যাটাস পরিবর্তন করতে ক্লিক করুন"
                          className="hover:opacity-80 transition cursor-pointer"
                        >
                          <CarStatusBadge status={car.status} />
                        </button>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/cars/${car._id}`}
                            className="p-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition"
                            title="বিস্তারিত দেখুন"
                          >
                            👁️ দেখুন
                          </Link>
                          <Link
                            to={`/admin/cars/${car._id}/edit`}
                            className="p-1.5 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-semibold transition"
                            title="এডিট করুন"
                          >
                            ✏️ এডিট
                          </Link>
                          <button
                            onClick={() => setDeleteModalCar(car)}
                            className="p-1.5 text-xs bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-semibold transition"
                            title="মুছে ফেলুন"
                          >
                            🗑️ ডিলিট
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium">
                  মোট {pagination.total} টি গাড়ির মধ্যে {cars.length} টি দেখানো হচ্ছে
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 disabled:opacity-40"
                  >
                    পূর্ববর্তী
                  </button>
                  <span className="px-3 py-1.5 bg-gray-100 rounded-lg font-bold">
                    {pagination.page} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 disabled:opacity-40"
                  >
                    পরবর্তী
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Change Status Modal */}
        {statusModalCar && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">
                🔄 গাড়ির স্ট্যাটাস আপডেট করুন
              </h3>
              <p className="text-xs text-gray-600">
                গাড়ি: <strong className="text-gray-800">{statusModalCar.name}</strong> ({statusModalCar.registrationNumber})
              </p>

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
                  onClick={() => setStatusModalCar(null)}
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
        {deleteModalCar && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
              <div className="text-center">
                <span className="text-4xl">⚠️</span>
                <h3 className="text-lg font-bold text-red-700 mt-2">গাড়িটি মুছে ফেলতে নিশ্চিত?</h3>
                <p className="text-xs text-gray-600 mt-1">
                  আপনি গাড়ি <strong>"{deleteModalCar.name}"</strong> ({deleteModalCar.registrationNumber}) মুছে ফেলতে যাচ্ছেন। এই বার্তাটি পরবর্তীতে ফেরত নেওয়া সম্ভব নয়।
                </p>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => setDeleteModalCar(null)}
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

export default AdminCars;
