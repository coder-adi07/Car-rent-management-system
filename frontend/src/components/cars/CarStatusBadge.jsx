import React from 'react';

const STATUS_MAP = {
  available: {
    label: 'উপলব্ধ (Available)',
    className: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    dotColor: 'bg-emerald-500',
  },
  rented: {
    label: 'ভাড়ায় আছে (Rented)',
    className: 'bg-blue-100 text-blue-800 border-blue-300',
    dotColor: 'bg-blue-500',
  },
  reserved: {
    label: 'সংরক্ষিত (Reserved)',
    className: 'bg-purple-100 text-purple-800 border-purple-300',
    dotColor: 'bg-purple-500',
  },
  maintenance: {
    label: 'রক্ষণাবেক্ষণে (Maintenance)',
    className: 'bg-amber-100 text-amber-800 border-amber-300',
    dotColor: 'bg-amber-500',
  },
  inactive: {
    label: 'নিষ্ক্রিয় (Inactive)',
    className: 'bg-gray-100 text-gray-700 border-gray-300',
    dotColor: 'bg-gray-400',
  },
};

const CarStatusBadge = ({ status }) => {
  const config = STATUS_MAP[status] || {
    label: status || 'অজানা',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
    dotColor: 'bg-gray-500',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${config.className}`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dotColor}`}></span>
      {config.label}
    </span>
  );
};

export default CarStatusBadge;
