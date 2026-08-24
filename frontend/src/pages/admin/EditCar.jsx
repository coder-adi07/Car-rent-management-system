import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import CarForm from '../../components/cars/CarForm';
import carService from '../../services/car.service';

const EditCar = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCar = async () => {
      setFetching(true);
      setError(null);
      try {
        const response = await carService.getCarById(id);
        if (response.success && response.data?.car) {
          setCar(response.data.car);
        } else {
          setError('গাড়ির তথ্য পাওয়া যায়নি।');
        }
      } catch (err) {
        setError(err.message || 'গাড়ির তথ্য লোড করতে সমস্যা হয়েছে।');
      } finally {
        setFetching(false);
      }
    };

    fetchCar();
  }, [id]);

  const handleSubmit = async (carData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await carService.updateCar(id, carData);
      if (response.success) {
        navigate('/admin/cars', {
          state: { message: `গাড়ি "${response.data.car.name}" এর তথ্য সফলভাবে আপডেট করা হয়েছে।` },
        });
      }
    } catch (err) {
      setError(err.message || 'গাড়ির তথ্য আপডেট করতে ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            to="/admin/cars"
            className="text-emerald-700 hover:text-emerald-800 text-sm font-semibold flex items-center gap-1"
          >
            ← কার তালিকায় ফিরে যান
          </Link>
        </div>

        {fetching && (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
            <p className="text-sm text-gray-600 mt-4 font-medium">গাড়ির তথ্য লোড হচ্ছে...</p>
          </div>
        )}

        {!fetching && error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl mb-6 text-sm flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} className="font-bold">✖</button>
          </div>
        )}

        {!fetching && car && (
          <CarForm initialValues={car} onSubmit={handleSubmit} isLoading={loading} isEdit={true} />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default EditCar;
