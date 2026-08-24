import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import CarForm from '../../components/cars/CarForm';
import carService from '../../services/car.service';

const AddCar = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (carData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await carService.createCar(carData);
      if (response.success) {
        navigate('/admin/cars', {
          state: { message: `নতুন গাড়ি "${response.data.car.name}" সফলভাবে যুক্ত করা হয়েছে।` },
        });
      }
    } catch (err) {
      setError(err.message || 'গাড়ি যুক্ত করতে ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/admin/cars"
            className="text-emerald-700 hover:text-emerald-800 text-sm font-semibold flex items-center gap-1"
          >
            ← এডমিন কার তালিকায় ফিরে যান
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl mb-6 text-sm flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} className="font-bold">✖</button>
          </div>
        )}

        <CarForm onSubmit={handleSubmit} isLoading={loading} isEdit={false} />
      </main>

      <Footer />
    </div>
  );
};

export default AddCar;
