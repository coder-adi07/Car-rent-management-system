import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import CarStatusBadge from '../../components/cars/CarStatusBadge';
import DriverCard from '../../components/drivers/DriverCard';
import carService from '../../services/car.service';
import reviewService from '../../services/review.service';
import { getImageUrl } from '../../utils/imageUrl';
import { useAuth } from '../../context/AuthContext';

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

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const fetchCar = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await carService.getCarById(id);
        if (response.success && response.data?.car) {
          setCar(response.data.car);
        } else {
          setError('গাড়ির তথ্য পাওয়া যায়নি।');
        }
      } catch (err) {
        setError(err.message || 'গাড়ির বিস্তারিত লোড করতে ব্যর্থ হয়েছে।');
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [id]);

  const handleBookingClick = () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/customer/bookings/new?carId=${car._id}`);
    } else {
      navigate(`/customer/bookings/new?carId=${car._id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/cars"
            className="text-emerald-700 hover:text-emerald-800 text-sm font-semibold flex items-center gap-1"
          >
            ← গাড়ির তালিকায় ফিরে যান
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
            <p className="text-sm text-gray-600 mt-4 font-medium">গাড়ির বিস্তারিত লোড হচ্ছে...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center my-8 shadow-sm">
            <span className="text-4xl">❌</span>
            <h3 className="text-xl font-bold text-red-700 mt-3">গাড়ি পাওয়া যায়নি</h3>
            <p className="text-sm text-gray-600 mt-1">{error}</p>
            <Link
              to="/cars"
              className="mt-5 inline-block px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition"
            >
              গাড়ির তালিকায় ফিরে যান
            </Link>
          </div>
        )}

        {/* Car Details Card */}
        {!loading && !error && car && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 lg:p-8">
            {/* Gallery Left Column */}
            <div className="lg:col-span-7 space-y-4">
              <div className="relative h-72 sm:h-96 bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
                {car.images && car.images.length > 0 ? (
                  <img
                    src={getImageUrl(car.images[activeImageIndex] || car.images[0])}
                    alt={car.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-emerald-50 text-emerald-800">
                    <span className="text-6xl">🚗</span>
                    <span className="text-sm font-bold mt-2">{car.brand} {car.model}</span>
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <CarStatusBadge status={car.status} />
                </div>
              </div>

              {/* Thumbnail List */}
              {car.images && car.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {car.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-20 h-16 rounded-xl overflow-hidden border-2 transition ${
                        activeImageIndex === idx ? 'border-emerald-600 shadow' : 'border-transparent opacity-70'
                      }`}
                    >
                      <img src={getImageUrl(img)} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Description */}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-base font-bold text-gray-900 mb-2">📄 বিবরণ</h3>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {car.description || 'এই গাড়ির জন্য অতিরিক্ত কোনো বিবরণ যুক্ত করা হয়নি।'}
                </p>
              </div>
            </div>

            {/* Info Right Column */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg uppercase">
                    {CAR_TYPE_LABELS[car.carType] || car.carType}
                  </span>
                  <span className="text-xs text-gray-500 font-semibold">মডেল সাল: {car.year}</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{car.name}</h1>
                <p className="text-sm text-gray-500 mt-1">
                  ব্র্যান্ড: <strong className="text-gray-800">{car.brand}</strong> | মডেল: <strong className="text-gray-800">{car.model}</strong>
                </p>
                <p className="text-xs text-gray-400 mt-1">রেজিস্ট্রেশন: {car.registrationNumber}</p>

                {/* Price Display Box */}
                <div className="mt-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-emerald-700 font-medium block">দৈনিক ভাড়ার হার</span>
                    <span className="text-3xl font-extrabold text-emerald-600">৳{car.dailyRentalPrice?.toLocaleString('bn-BD')}</span>
                    <span className="text-xs text-gray-600"> / দিন</span>
                  </div>
                </div>

                {/* Technical Specs List */}
                <div className="mt-6 space-y-3">
                  <h3 className="text-sm font-bold text-gray-900">⚙️ গাড়ি সম্পর্কিত বিবরণ</h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-gray-500 block">গিয়ার সিস্টেম</span>
                      <strong className="text-gray-800 text-sm">{TRANSMISSION_LABELS[car.transmission] || car.transmission}</strong>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-gray-500 block">জ্বালানি টাইপ</span>
                      <strong className="text-gray-800 text-sm">{FUEL_LABELS[car.fuelType] || car.fuelType}</strong>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-gray-500 block">আসন সংখ্যা</span>
                      <strong className="text-gray-800 text-sm">{car.seatingCapacity} জন</strong>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-gray-500 block">বর্তমান মাইলেজ</span>
                      <strong className="text-gray-800 text-sm">{car.currentMileage || 0} কিমি</strong>
                    </div>
                  </div>
                </div>

                {/* Driver Profile Card */}
                <div className="mt-6">
                  <DriverCard driver={car.assignedDriver} title="👨‍✈️ গাড়ির নির্ধারিত ড্রাইভারের বিবরণ" />
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-gray-100">
                {car.status === 'available' ? (
                  <button
                    onClick={handleBookingClick}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base rounded-2xl transition shadow-md flex items-center justify-center gap-2"
                  >
                    🚀 এখনই বুক করুন (Book Now)
                  </button>
                ) : (
                  <div className="w-full py-3 bg-gray-100 text-gray-500 font-semibold text-center text-sm rounded-2xl border border-gray-200">
                    গাড়িটি বর্তমানে উপলব্ধ নেই ({car.status})
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Public Published Reviews Section */}
        {!loading && !error && car && (
          <CarReviewsSection carId={car._id} />
        )}
      </main>

      <Footer />
    </div>
  );
};

// Subcomponent to fetch and display published reviews for this car
const CarReviewsSection = ({ carId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCarReviews = async () => {
      setLoading(true);
      try {
        const res = await reviewService.getAllReviews({ car: carId, status: 'published' });
        if (res.success && res.data?.reviews) {
          setReviews(res.data.reviews);
        }
      } catch (err) {
        console.error('Error fetching car reviews:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCarReviews();
  }, [carId]);

  if (loading) {
    return <div className="py-8 text-center text-xs text-gray-500">রিভিউ লোড হচ্ছে...</div>;
  }

  if (reviews.length === 0) {
    return (
      <div className="mt-8 bg-white rounded-3xl border border-gray-200 p-8 text-center text-xs text-gray-500 shadow-sm">
        ⭐ এই গাড়ির জন্য এখনও কোনো কাস্টমার রিভিউ নেই।
      </div>
    );
  }

  const avgRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <div className="mt-8 bg-white rounded-3xl border border-gray-200 p-6 lg:p-8 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">⭐ কাস্টমার রিভিউ ও রেটিং</h3>
          <p className="text-xs text-gray-500 mt-0.5">গ্রাহকদের সতস্ফূর্ত প্রতিক্রিয়া ও অভিজ্ঞতা</p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-extrabold text-amber-500">{avgRating}</span>
          <span className="text-xs text-gray-500 block">গড় রেটিং ({reviews.length} টি রিভিউ)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.map((rev) => (
          <div key={rev._id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-900">{rev.customer?.fullName || 'গ্রাহক'}</span>
              <span className="text-amber-500 font-bold">★ {rev.rating}/৫</span>
            </div>
            {rev.comment && <p className="text-gray-700 italic">"{rev.comment}"</p>}
            <span className="text-[10px] text-gray-400 block">{new Date(rev.createdAt).toLocaleDateString('bn-BD')}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CarDetails;
