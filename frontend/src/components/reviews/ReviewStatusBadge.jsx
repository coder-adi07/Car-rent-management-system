import React from 'react';

const STATUS_MAP = {
  published: {
    label: 'প্রকাশিত (Published)',
    className: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    dotColor: 'bg-emerald-500',
  },
  hidden: {
    label: 'গোপন (Hidden)',
    className: 'bg-gray-100 text-gray-700 border-gray-300',
    dotColor: 'bg-gray-400',
  },
};

const ReviewStatusBadge = ({ status }) => {
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

export default ReviewStatusBadge;
