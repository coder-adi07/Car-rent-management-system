import React from 'react';

const STATUS_MAP = {
  scheduled: {
    label: 'নির্ধারিত (Scheduled)',
    className: 'bg-blue-100 text-blue-800 border-blue-300',
    dotColor: 'bg-blue-500',
  },
  active: {
    label: 'চলমান (Active)',
    className: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    dotColor: 'bg-emerald-500',
  },
  completed: {
    label: 'সম্পন্ন (Completed)',
    className: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    dotColor: 'bg-indigo-500',
  },
  overdue: {
    label: 'মেয়াদোত্তীর্ণ (Overdue)',
    className: 'bg-rose-100 text-rose-800 border-rose-300',
    dotColor: 'bg-rose-500',
  },
  cancelled: {
    label: 'বাতিলকৃত (Cancelled)',
    className: 'bg-gray-100 text-gray-700 border-gray-300',
    dotColor: 'bg-gray-400',
  },
};

const RentalStatusBadge = ({ status }) => {
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

export default RentalStatusBadge;
