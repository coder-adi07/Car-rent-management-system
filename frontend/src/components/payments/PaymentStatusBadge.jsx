import React from 'react';

const STATUS_MAP = {
  pending: {
    label: 'অপেক্ষমাণ (Pending)',
    className: 'bg-amber-100 text-amber-800 border-amber-300',
    dotColor: 'bg-amber-500',
  },
  paid: {
    label: 'পরিশোধিত (Paid)',
    className: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    dotColor: 'bg-emerald-500',
  },
  failed: {
    label: 'ব্যর্থ (Failed)',
    className: 'bg-rose-100 text-rose-800 border-rose-300',
    dotColor: 'bg-rose-500',
  },
  refunded: {
    label: 'রিফান্ডকৃত (Refunded)',
    className: 'bg-purple-100 text-purple-800 border-purple-300',
    dotColor: 'bg-purple-500',
  },
  cancelled: {
    label: 'বাতিলকৃত (Cancelled)',
    className: 'bg-gray-100 text-gray-700 border-gray-300',
    dotColor: 'bg-gray-400',
  },
};

const PaymentStatusBadge = ({ status }) => {
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

export default PaymentStatusBadge;
