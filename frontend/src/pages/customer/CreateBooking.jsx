import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import BookingForm from '../../components/bookings/BookingForm';
import carService from '../../services/car.service';
import bookingService from '../../services/booking.service';

const CreateBooking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const carId = searchParams.get('carId');

  const [car, setCar] = useState(null);
  const [fetchingCar, setFetchingCar] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCarDetails = async () => {
      if (!carId) {
        setError('কোনো গাড়ি নির্বাচন করা হয়নি।');
        setFetchingCar(false);
        return;
      }

      setFetchingCar(true);
      setError(null);
      try {
        const response = await carService.getCarById(carId);
        if (response.success && response.data?.car) {
          setCar(response.data.car);
        } else {
          setError('নির্বাচিত গাড়ির বিবরণ পাওয়া যায়নি।');
        }
      } catch (err) {
        setError(err.message || 'গাড়ির তথ্য লোড করতে ব্যর্থ হয়েছে।');
      } finally {
        setFetchingCar(false);
      }
    };

    fetchCarDetails();
  }, [carId]);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setError(null);
    try {
      const response = await bookingService.createBooking(payload);
      if (response.success && response.data?.booking) {
        const newBooking = response.data.booking;
        navigate(`/customer/bookings/${newBooking._id}`, {
          state: { message: 'বুকিং অনুরোধ সফলভাবে জমা দেওয়া হয়েছে! এডমিন শীঘ্রই আপনার বুকিংটি নিশ্চিত করবেন।' },
        });
      }
    } catch (err) {
      setError(err.message || 'বুকিং জমা দিতে ব্যর্থ হয়েছে।');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back navigation */}
        <div className="mb-6">
          <Link
            to={carId ? `/cars/${carId}` : '/cars'}
            className="text-emerald-700 hover:text-emerald-800 text-sm font-semibold flex items-center gap-1"
          >
            ← গাড়ির বিবরনে ফিরে যান
          </Link>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-6">
          📝 গাড়ি বুকিং ফরম (Car Booking Request)
        </h1>

        {/* Loading State */}
        {fetchingCar && (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
            <p className="text-sm text-gray-600 mt-4 font-medium">গাড়ির তথ্য লোড হচ্ছে...</p>
          </div>
        )}

        {/* Error State */}
        {!fetchingCar && error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl mb-6 text-center">
            <span className="text-3xl">⚠️</span>
            <h3 className="text-lg font-bold text-red-800 mt-2">বুকিং করা সম্ভব হচ্ছে না</h3>
            <p className="text-sm text-red-600 mt-1">{error}</p>
            <Link
              to="/cars"
              className="mt-4 inline-block px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition"
            >
              অন্য গাড়ি নির্বাচন করুন
            </Link>
          </div>
        )}

        {/* Booking Form */}
        {!fetchingCar && !error && car && (
          <BookingForm car={car} onSubmit={handleSubmit} isLoading={submitting} />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CreateBooking;
