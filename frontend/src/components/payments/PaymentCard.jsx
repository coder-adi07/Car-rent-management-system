import React from 'react';
import { Link } from 'react-router-dom';
import PaymentStatusBadge from './PaymentStatusBadge';

const METHOD_LABELS = {
  bkash: 'bKash (বিকাশ)',
  nagad: 'Nagad (নগদ)',
  cash: 'Cash (নগদ টাকা)',
};

const PaymentCard = ({ payment, isAdmin = false }) => {
  const detailsLink = isAdmin ? `/admin/payments/${payment._id}` : `/customer/payments/${payment._id}`;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-2xl flex-shrink-0">
          💳
        </div>

        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded">
              #{payment.paymentId}
            </span>
            <PaymentStatusBadge status={payment.status} />
          </div>

          <h3 className="text-sm font-bold text-gray-900">
            বুকিং আইডি: #{payment.booking?.bookingId || payment.booking || 'N/A'}
          </h3>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
            <span>পদ্ধতি: <strong className="text-gray-800">{METHOD_LABELS[payment.paymentMethod] || payment.paymentMethod}</strong></span>
            {payment.transactionId && <span>ট্রানজেকশন আইডি: <strong className="text-gray-800">{payment.transactionId}</strong></span>}
            <span>তারিখ: {new Date(payment.paymentDate || payment.createdAt).toLocaleDateString('bn-BD')}</span>
          </div>

          {isAdmin && payment.customer && (
            <p className="text-xs text-gray-600">
              গ্রাহক: <strong>{payment.customer.fullName || payment.customer.user?.name || 'কাস্টমার'}</strong> ({payment.customer.phone || payment.customer.user?.phone})
            </p>
          )}
        </div>
      </div>

      <div className="w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0 gap-2">
        <div className="text-right">
          <span className="text-xs text-gray-500 block">পরিমাণ</span>
          <span className="text-lg font-extrabold text-emerald-600">
            ৳{payment.amount?.toLocaleString('bn-BD')}
          </span>
        </div>

        <Link
          to={detailsLink}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow"
        >
          বিবরণ দেখুন →
        </Link>
      </div>
    </div>
  );
};

export default PaymentCard;
