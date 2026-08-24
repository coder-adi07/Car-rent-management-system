import React, { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import CarCard from '../../components/cars/CarCard';
import CarFilter from '../../components/cars/CarFilter';
import carService from '../../services/car.service';

const Cars = () => {
  const [cars, setCars] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({
    search: '',
    carType: '',
    status: '',
    minPrice: '',
    maxPrice: '',
    page: 1,
    limit: 9,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      limit: 9,
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setFilters((prev) => ({ ...prev, page: newPage }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            🚗 গাড়ির তালিকা (Browse Cars)
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            আপনার প্রয়োজনে সেরা গাড়ি বুক করুন। নিচে ফিল্টার ব্যবহার করে দ্রুত অনুসন্ধান করুন।
          </p>
        </div>

        {/* Filter Component */}
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
            <p className="text-sm text-gray-600 mt-4 font-medium">গাড়ির তথ্য লোড হচ্ছে...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center my-8">
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
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center my-8">
            <span className="text-5xl">🔍</span>
            <h3 className="text-xl font-bold text-gray-800 mt-3">কোনো গাড়ি পাওয়া যায়নি</h3>
            <p className="text-sm text-gray-500 mt-1">
              আপনার ফিল্টার অনুযায়ী কোনো গাড়ি পাওয়া যায়নি। অনুগ্রহ করে ফিল্টার রিক্লিয়ার করে আবার চেষ্টা করুন।
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition"
            >
              সব ফিল্টার মুছে ফেলুন
            </button>
          </div>
        )}

        {/* Cars Grid */}
        {!loading && !error && cars.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-semibold text-gray-500">
                মোট <strong className="text-emerald-600">{pagination.total}</strong> টি গাড়ি পাওয়া গেছে
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map((car) => (
                <CarCard key={car._id} car={car} />
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  ← পূর্ববর্তী
                </button>
                <span className="px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl">
                  পৃষ্ঠা {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  পরবর্তী →
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Cars;
