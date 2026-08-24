import React from 'react';
import { Link } from 'react-router-dom';
import CarStatusBadge from './CarStatusBadge';
import { getImageUrl } from '../../utils/imageUrl';

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

const CarCard = ({ car, detailLink = `/cars/${car._id}` }) => {
  const imageUrl = car.images && car.images.length > 0 ? getImageUrl(car.images[0]) : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition duration-200 flex flex-col overflow-hidden group">
      {/* Car Image Container */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={car.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className={`w-full h-full flex flex-col items-center justify-center bg-emerald-50 text-emerald-800 ${
            imageUrl ? 'hidden' : 'flex'
          }`}
        >
          <span className="text-4xl">🚗</span>
          <span className="text-xs font-semibold mt-1 text-emerald-700">{car.brand} {car.model}</span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <CarStatusBadge status={car.status} />
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              {CAR_TYPE_LABELS[car.carType] || car.carType}
            </span>
            <span className="text-xs text-gray-500 font-medium">মডেল: {car.year}</span>
          </div>

          <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-emerald-600 transition">
            {car.name}
          </h3>
          <p className="text-xs text-gray-500 mb-3">
            {car.brand} • {car.model} ({car.registrationNumber})
          </p>

          {/* Quick Specs Grid */}
          <div className="grid grid-cols-3 gap-2 py-2 border-y border-gray-100 text-xs text-gray-600 mb-4">
            <div className="flex flex-col items-center justify-center p-1 bg-gray-50 rounded-lg">
              <span className="font-semibold text-gray-800">⚙️ গিয়ার</span>
              <span>{TRANSMISSION_LABELS[car.transmission] || car.transmission}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-1 bg-gray-50 rounded-lg">
              <span className="font-semibold text-gray-800">⛽ ফুয়েল</span>
              <span>{FUEL_LABELS[car.fuelType] || car.fuelType}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-1 bg-gray-50 rounded-lg">
              <span className="font-semibold text-gray-800">👥 আসন</span>
              <span>{car.seatingCapacity} জন</span>
            </div>
          </div>
        </div>

        {/* Price & Action */}
        <div className="pt-2 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 block">দৈনিক ভাড়া</span>
            <span className="text-xl font-extrabold text-emerald-600">৳{(car.dailyRentalPrice || 0).toLocaleString('bn-BD')}</span>
            <span className="text-xs text-gray-500"> / দিন</span>
          </div>

          <Link
            to={detailLink}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition shadow-sm flex items-center gap-1"
          >
            বিস্তারিত দেখুন →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CarCard;
