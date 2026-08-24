import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import BookingStatusBadge from '../../components/bookings/BookingStatusBadge';
import bookingService from '../../services/booking.service';
import driverService from '../../services/driver.service';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Status Change Modal State
  const [statusModalBooking, setStatusModalBooking] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Assign Driver Modal State
  const [assignModalBooking, setAssignModalBooking] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [fetchingDrivers, setFetchingDrivers] = useState(false);
  const [assigningDriver, setAssigningDriver] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await bookingService.getAllBookings({
        status: statusFilter,
        search: searchQuery,
      });
      if (response.success && response.data) {
        setBookings(response.data.bookings || []);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      }
    } catch (err) {
      setError(err.message || 'বুকিং তালিকা লোড করতে ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  // Status Update Handler
  const handleOpenStatusModal = (booking) => {
    setStatusModalBooking(booking);
    setSelectedStatus(booking.status);
    setCancellationReason('');
  };

  const handleUpdateStatus = async () => {
    if (!statusModalBooking || !selectedStatus) return;
    setUpdatingStatus(true);
    try {
      const res = await bookingService.updateBookingStatus(
        statusModalBooking._id,
        selectedStatus,
        cancellationReason
      );
      if (res.success) {
        setSuccessMsg(`বুকিং #${statusModalBooking.bookingId} এর স্ট্যাটাস আপডেট করা হয়েছে।`);
        setStatusModalBooking(null);
        fetchBookings();
      }
    } catch (err) {
      alert(err.message || 'স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Driver Assignment Handler
  const handleOpenAssignModal = async (booking) => {
    setAssignModalBooking(booking);
    setSelectedDriverId(booking.driver?._id || '');
    setFetchingDrivers(true);
    try {
      const res = await driverService.getAllDrivers({ limit: 100 });
      if (res.success && res.data?.drivers) {
        setDrivers(res.data.drivers.filter((d) => d.status !== 'inactive' && d.status !== 'suspended'));
      }
    } catch (err) {
      alert('ড্রাইভারদের তালিকা লোড করতে সমস্যা হয়েছে।');
    } finally {
      setFetchingDrivers(false);
    }
  };

  const handleAssignDriver = async () => {
    if (!assignModalBooking || !selectedDriverId) return;
    setAssigningDriver(true);
    try {
      const res = await bookingService.assignDriver(assignModalBooking._id, selectedDriverId);
      if (res.success) {
        setSuccessMsg(`বুকিং #${assignModalBooking.bookingId} তে ড্রাইভার সফলভাবে বরাদ্দ করা হয়েছে।`);
        setAssignModalBooking(null);
        fetchBookings();
      }
    } catch (err) {
      alert(err.message || 'ড্রাইভার নিয়োগ করতে সমস্যা হয়েছে।');
    } finally {
      setAssigningDriver(false);
    }
  };

  // Metrics
  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;
  const completedCount = bookings.filter((b) => b.status === 'completed').length;
  const cancelledCount = bookings.filter((b) => b.status === 'cancelled' || b.status === 'rejected').length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              🛠️ এডমিন বুকিং ম্যানেজমেন্ট (Booking Management)
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              গ্রাহকদের সমস্ত বুকিং অনুরোধ পর্যালোচনা করুন, নিশ্চিত বা বাতিল করুন এবং ড্রাইভার বরাদ্দ করুন।
            </p>
          </div>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 mb-6 text-sm flex items-center justify-between">
            <span>✅ {successMsg}</span>
            <button onClick={() => setSuccessMsg(null)} className="font-bold">✖</button>
          </div>
        )}

        {/* Summary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-xs font-semibold text-gray-500 block">মোট বুকিং</span>
            <span className="text-2xl font-extrabold text-gray-900 mt-1 block">{pagination.total}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-xs font-semibold text-gray-500 block">অপেক্ষমাণ (Pending)</span>
            <span className="text-2xl font-extrabold text-amber-600 mt-1 block">{pendingCount}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-xs font-semibold text-gray-500 block">নিশ্চিতকৃত (Confirmed)</span>
            <span className="text-2xl font-extrabold text-blue-600 mt-1 block">{confirmedCount}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-xs font-semibold text-gray-500 block">সম্পন্ন (Completed)</span>
            <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">{completedCount}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-xs font-semibold text-gray-500 block">বাতিল / প্রত্যাখ্যাত</span>
            <span className="text-2xl font-extrabold text-rose-600 mt-1 block">{cancelledCount}</span>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 shadow-sm">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="বুকিং আইডি দিয়ে অনুসন্ধান করুন (যেমন: BK-2026-0001)..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
              />
              <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white font-medium focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">সব স্ট্যাটাস (All Statuses)</option>
              <option value="pending">অপেক্ষমাণ (Pending)</option>
              <option value="confirmed">নিশ্চিতকৃত (Confirmed)</option>
              <option value="completed">সম্পন্ন (Completed)</option>
              <option value="cancelled">বাতিলকৃত (Cancelled)</option>
              <option value="rejected">প্রত্যাখ্যাত (Rejected)</option>
            </select>

            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow"
            >
              অনুসন্ধান
            </button>
          </form>
        </div>

        {/* Loading */}
        {loading && (
          <div className="py-16 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
            <p className="text-sm text-gray-600 mt-4 font-medium">বুকিং তালিকা লোড হচ্ছে...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center my-6">
            <span className="text-3xl">⚠️</span>
            <h3 className="text-lg font-bold text-red-800 mt-2">ত্রুটি ঘটেছে</h3>
            <p className="text-sm text-red-600 mt-1">{error}</p>
            <button
              onClick={fetchBookings}
              className="mt-4 px-5 py-2 bg-red-600 text-white text-xs font-semibold rounded-xl"
            >
              পুনরায় চেষ্টা করুন
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && bookings.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center my-6">
            <span className="text-4xl">📋</span>
            <h3 className="text-xl font-bold text-gray-800 mt-3">কোনো বুকিং পাওয়া যায়নি</h3>
            <p className="text-sm text-gray-500 mt-1">
              আপনার ফিল্টার মানদণ্ডে কোনো বুকিং রেকর্ড নেই।
            </p>
          </div>
        )}

        {/* Admin Bookings Table */}
        {!loading && !error && bookings.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">বুকিং আইডি ও কাস্টমার</th>
                    <th className="px-4 py-3">গাড়ি</th>
                    <th className="px-4 py-3">তারিখ ও সময়সূচী</th>
                    <th className="px-4 py-3">মোট ভাড়া</th>
                    <th className="px-4 py-3">স্ট্যাটাস</th>
                    <th className="px-4 py-3">ড্রাইভার</th>
                    <th className="px-4 py-3 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.map((b) => (
                    <tr key={b._id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <Link
                          to={`/admin/bookings/${b._id}`}
                          className="font-bold text-emerald-700 hover:underline block"
                        >
                          #{b.bookingId}
                        </Link>
                        <span className="font-semibold text-gray-900 block text-xs">
                          {b.customer?.fullName || b.customer?.name || 'গ্রাহক'}
                        </span>
                        <span className="text-xs text-gray-400 block">{b.customer?.phone || 'ফোন নেই'}</span>
                      </td>

                      <td className="px-4 py-3">
                        <span className="font-bold text-gray-800 text-xs block">{b.car?.name || 'গাড়ি'}</span>
                        <span className="text-xs text-gray-500 block">
                          {b.car?.brand} {b.car?.model}
                        </span>
                        <span className="text-xs text-gray-400 block">{b.car?.registrationNumber}</span>
                      </td>

                      <td className="px-4 py-3 text-xs text-gray-600">
                        <span>{new Date(b.startDate).toLocaleDateString('bn-BD')}</span>
                        <span className="block text-gray-400 font-semibold">{b.rentalDays} দিন</span>
                      </td>

                      <td className="px-4 py-3 font-bold text-emerald-600 text-sm">
                        ৳{b.totalAmount?.toLocaleString('bn-BD')}
                      </td>

                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleOpenStatusModal(b)}
                          title="স্ট্যাটাস পরিবর্তন করতে ক্লিক করুন"
                          className="hover:opacity-80 transition cursor-pointer"
                        >
                          <BookingStatusBadge status={b.status} />
                        </button>
                      </td>

                      <td className="px-4 py-3 text-xs">
                        {b.driver ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-blue-700">👨‍✈️ {b.driver.fullName || 'ড্রাইভার'}</span>
                            <button
                              onClick={() => handleOpenAssignModal(b)}
                              className="text-xs text-blue-600 underline font-bold"
                            >
                              পরিবর্তন
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenAssignModal(b)}
                            className="px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded-lg text-xs font-bold"
                          >
                            + ড্রাইভার যোগ
                          </button>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/admin/bookings/${b._id}`}
                          className="p-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition"
                        >
                          👁️ বিবরণ
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Change Status Modal */}
        {statusModalBooking && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">
                🔄 বুকিং স্ট্যাটাস আপডেট করুন
              </h3>
              <p className="text-xs text-gray-600">
                বুকিং আইডি: <strong className="text-gray-800">#{statusModalBooking.bookingId}</strong>
              </p>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">নতুন স্ট্যাটাস নির্বাচন করুন</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-sm bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="pending">অপেক্ষমাণ (pending)</option>
                  <option value="confirmed">নিশ্চিতকৃত (confirmed)</option>
                  <option value="completed">সম্পন্ন (completed)</option>
                  <option value="rejected">প্রত্যাখ্যাত (rejected)</option>
                  <option value="cancelled">বাতিলকৃত (cancelled)</option>
                </select>
              </div>

              {['rejected', 'cancelled'].includes(selectedStatus) && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">বাতিলের কারণ (ঐচ্ছিক)</label>
                  <textarea
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    rows="2"
                    placeholder="যেমন: গাড়ি অনুপলব্ধ থাকায় বাতিল..."
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  ></textarea>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setStatusModalBooking(null)}
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

        {/* Driver Assignment Modal */}
        {assignModalBooking && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">
                👨‍✈️ ড্রাইভার নিয়োগ করুন
              </h3>
              <p className="text-xs text-gray-600">
                বুকিং আইডি: <strong className="text-gray-800">#{assignModalBooking.bookingId}</strong>
              </p>

              {fetchingDrivers ? (
                <div className="py-8 text-center text-xs text-gray-500">ড্রাইভার তালিকা লোড হচ্ছে...</div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">ড্রাইভার নির্বাচন করুন</label>
                  <select
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-sm bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- ড্রাইভার নির্বাচন করুন --</option>
                    {drivers.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.fullName} ({d.phone}) - {d.status}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setAssignModalBooking(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleAssignDriver}
                  disabled={assigningDriver || !selectedDriverId}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow disabled:opacity-50"
                >
                  {assigningDriver ? 'নিয়োগ হচ্ছে...' : 'ড্রাইভার বরাদ্দ করুন'}
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

export default AdminBookings;
