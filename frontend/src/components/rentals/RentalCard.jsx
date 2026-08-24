import React from 'react';
import { Link } from 'react-router-dom';
import RentalStatusBadge from './RentalStatusBadge';

const RentalCard = ({ rental, isAdmin = false }) => {
  const detailsLink = isAdmin ? `/admin/rentals/${rental._id}` : `/customer/rentals/${rental._id}`;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl flex-shrink-0">
          {rental.car?.images && rental.car.images.length > 0 ? (
            <img src={rental.car.images[0]} alt="Car" className="w-full h-full object-cover rounded-xl" />
          ) : (
            '🚗'
          )}
        </div>

        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded">
              #{rental.rentalId}
            </span>
            <RentalStatusBadge status={rental.status} />
          </div>

          <h3 className="text-base font-bold text-gray-900">
            {rental.car?.name || 'গাড়ির তথ্য'} ({rental.car?.brand} {rental.car?.model})
          </h3>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
            <span>📅 {new Date(rental.startDate).toLocaleDateString('bn-BD')} থেকে {new Date(rental.expectedReturnDate).toLocaleDateString('bn-BD')}</span>
            <span>বুকিং: <strong className="text-gray-800">#{rental.booking?.bookingId || 'N/A'}</strong></span>
          </div>

          {isAdmin && rental.customer && (
            <p className="text-xs text-gray-600">
              গ্রাহক: <strong>{rental.customer.fullName || rental.customer.user?.name || 'কাস্টমার'}</strong>
            </p>
          )}
        </div>
      </div>

      <div className="w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0 gap-2">
        <div className="text-right">
          <span className="text-xs text-gray-500 block">মোট ভাড়া</span>
          <span className="text-lg font-extrabold text-blue-600">
            ৳{rental.finalAmount?.toLocaleString('bn-BD')}
          </span>
        </div>

        <Link
          to={detailsLink}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow"
        >
          চুক্তি বিবরণ →
        </Link>
      </div>
    </div>
  );
};

export default RentalCard;
