import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import RentalStatusBadge from '../../components/rentals/RentalStatusBadge';
import rentalService from '../../services/rental.service';

const AdminRentals = () => {
  const [rentals, setRentals] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRentals = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await rentalService.getAllRentals({
        status: statusFilter,
        search: searchQuery,
        page: pagination.page,
      });
      if (response.success && response.data) {
        setRentals(response.data.rentals || []);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      }
    } catch (err) {
      setError(err.message || 'রেন্টাল তালিকা লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, [statusFilter, searchQuery, pagination.page]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              📄 এডমিন রেন্টাল চুক্তি ম্যানেজমেন্ট (Rental Contracts)
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              একটিভ এবং সম্পন্ন সমস্ত রেন্টাল চুক্তি তদারকি করুন ও গাড়ি সপর্দ গ্রহণ (Vehicle Return) পরিচালনা করুন।
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-700">স্ট্যাটাস:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-xl text-xs bg-white font-semibold focus:ring-2 focus:ring-blue-500"
              >
                <option value="">সব চুক্তি (All)</option>
                <option value="scheduled">নির্ধারিত (Scheduled)</option>
                <option value="active">চলমান (Active)</option>
                <option value="completed">সম্পন্ন (Completed)</option>
                <option value="overdue">মেয়াদোত্তীর্ণ (Overdue)</option>
                <option value="cancelled">বাতিলকৃত (Cancelled)</option>
              </select>
            </div>

            <input
              type="text"
              placeholder="রেন্টাল আইডি সার্চ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-xl text-xs bg-white font-medium focus:ring-2 focus:ring-blue-500 min-w-[200px]"
            />
          </div>

          <span className="text-xs text-gray-500 font-semibold self-end sm:self-auto">
            মোট রেন্টাল চুক্তি: <strong className="text-blue-600">{pagination.total}</strong> টি
          </span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-16 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-sm text-gray-600 mt-4 font-medium">রেন্টাল চুক্তি তালিকা লোড হচ্ছে...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center my-6">
            <span className="text-3xl">⚠️</span>
            <h3 className="text-lg font-bold text-red-800 mt-2">ত্রুটি ঘটেছে</h3>
            <p className="text-sm text-red-600 mt-1">{error}</p>
            <button
              onClick={fetchRentals}
              className="mt-4 px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition"
            >
              পুনরায় চেষ্টা করুন
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && rentals.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center my-6 shadow-sm">
            <span className="text-5xl">📄</span>
            <h3 className="text-xl font-bold text-gray-800 mt-3">কোনো রেন্টাল চুক্তি পাওয়া যায়নি</h3>
            <p className="text-sm text-gray-500 mt-1">আপনার ফিল্টার অনুযায়ী কোনো রেন্টাল রেকর্ড নেই।</p>
          </div>
        )}

        {/* Rentals Table */}
        {!loading && !error && rentals.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">রেন্টাল আইডি</th>
                    <th className="p-4">গাড়ি</th>
                    <th className="p-4">গ্রাহক</th>
                    <th className="p-4">মেয়াদকাল</th>
                    <th className="p-4">চূড়ান্ত টাকা</th>
                    <th className="p-4">স্ট্যাটাস</th>
                    <th className="p-4 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rentals.map((r) => (
                    <tr key={r._id} className="hover:bg-gray-50/80 transition">
                      <td className="p-4 font-bold text-blue-800">
                        <Link to={`/admin/rentals/${r._id}`} className="hover:underline">
                          #{r.rentalId}
                        </Link>
                      </td>
                      <td className="p-4 font-medium text-gray-900">
                        {r.car?.name || 'গাড়ি'}
                        <span className="block text-[11px] text-gray-500 font-normal">
                          {r.car?.brand} ({r.car?.registrationNumber})
                        </span>
                      </td>
                      <td className="p-4 font-medium text-gray-900">
                        {r.customer?.fullName || r.customer?.user?.name || 'গ্রাহক'}
                      </td>
                      <td className="p-4">
                        <span>{new Date(r.startDate).toLocaleDateString('bn-BD')}</span>
                        <span className="block text-[11px] text-gray-500">থেকে {new Date(r.expectedReturnDate).toLocaleDateString('bn-BD')}</span>
                      </td>
                      <td className="p-4 font-extrabold text-blue-700 text-sm">
                        ৳{r.finalAmount?.toLocaleString('bn-BD')}
                      </td>
                      <td className="p-4">
                        <RentalStatusBadge status={r.status} />
                      </td>
                      <td className="p-4 text-right space-x-1">
                        {['active', 'scheduled', 'overdue'].includes(r.status) && (
                          <Link
                            to={`/admin/rentals/${r._id}`}
                            className="px-2.5 py-1 bg-amber-50 text-amber-800 hover:bg-amber-100 font-bold rounded-lg transition"
                          >
                            🚗 ফেরত গ্রহণ
                          </Link>
                        )}
                        <Link
                          to={`/admin/rentals/${r._id}`}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition shadow"
                        >
                          ভিউ →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default AdminRentals;
