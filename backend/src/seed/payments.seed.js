const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Rental = require('../models/Rental');

const seedPayments = async () => {
  const bookings = await Booking.find({}).sort({ bookingId: 1 });

  if (bookings.length === 0) {
    console.log('Dependencies missing (Bookings required). Skipping payments seed.');
    return;
  }

  let created = 0;
  let skipped = 0;

  // Pre-fetch existing paymentIds into a Set for fast idempotency checks
  const existingPaymentIds = new Set(
    (await Payment.find({}, 'paymentId').lean()).map((p) => p.paymentId)
  );

  // Pre-fetch all Rentals into a Map indexed by booking ID for fast lookups
  const rentals = await Rental.find({}).lean();
  const rentalsMap = new Map(rentals.map((r) => [r.booking.toString(), r]));

  // Create realistic Payment records corresponding to each booking BK-2026-0001 through BK-2026-0100 (100 payments total)
  for (const booking of bookings) {
    const num = parseInt(booking.bookingId.replace('BK-2026-', ''), 10);
    const paymentId = `PAY-2026-${String(num).padStart(4, '0')}`;

    // Idempotency check: skip if payment record already exists
    if (existingPaymentIds.has(paymentId)) {
      skipped++;
      continue;
    }

    // Lookup corresponding Rental record from Map if one exists
    const rental = rentalsMap.get(booking._id.toString());

    let status = 'pending';
    let paymentMethod = 'bkash';
    let transactionId = null;
    let paymentDate = booking.startDate;
    let confirmedAt = null;
    let refundedAt = null;
    let refundReason = null;
    let notes = null;
    let amount = rental ? rental.finalAmount : booking.totalAmount;

    if (num <= 45) {
      // Completed bookings/rentals -> Fully Paid
      status = 'paid';
      paymentMethod =
        num % 3 === 0 ? 'cash' : num % 2 === 0 ? 'nagad' : 'bkash';
      transactionId =
        num % 3 === 0
          ? `REC-2026-${String(num).padStart(4, '0')}`
          : num % 2 === 0
          ? `NGD${90000 + num}X`
          : `BKS${80000 + num}Y`;
      paymentDate = booking.startDate;
      confirmedAt = new Date(booking.startDate.getTime() + 1800000);
      notes = 'সম্পূর্ণ ভাড়া সফলভাবে পরিশোধ করা হয়েছে।';
    } else if (num <= 70) {
      // Confirmed bookings & active/scheduled rentals -> Paid
      status = 'paid';
      paymentMethod = num % 2 === 0 ? 'bkash' : 'nagad';
      transactionId =
        num % 2 === 0 ? `BKS${80000 + num}Z` : `NGD${90000 + num}W`;
      paymentDate = booking.confirmedAt || booking.startDate;
      confirmedAt = booking.confirmedAt || booking.startDate;
      notes = 'অনলাইন পেমেন্টের মাধ্যমে বুকিং নিশ্চিত করা হয়েছে।';
    } else if (num <= 80) {
      // Pending bookings -> Pending payment
      status = 'pending';
      paymentMethod = num % 2 === 0 ? 'bkash' : 'nagad';
      transactionId =
        num % 2 === 0 ? `BKS${80000 + num}P` : `NGD${90000 + num}P`;
      paymentDate = booking.startDate;
      notes = 'পেমেন্ট অনুমোদনের অপেক্ষায় রয়েছে।';
    } else if (num <= 85) {
      // Pending bookings -> Failed payment attempt
      status = 'failed';
      paymentMethod = 'bkash';
      transactionId = `BKS${80000 + num}F`;
      paymentDate = booking.startDate;
      notes =
        'পেমেন্ট ব্যর্থ হয়েছে। অপর্যাপ্ত ব্যালেন্স অথবা ওটিপি সময়সীমা অতিক্রম করেছে।';
    } else if (num <= 95) {
      // Cancelled bookings -> Refunded payment
      status = 'refunded';
      paymentMethod = num % 2 === 0 ? 'bkash' : 'nagad';
      transactionId = `RFD${70000 + num}`;
      paymentDate = booking.startDate;
      confirmedAt = booking.startDate;
      refundedAt = booking.cancelledAt || new Date();
      refundReason =
        booking.cancellationReason ||
        'গ্রাহকের অনুরোধে বুকিং বাতিল হওয়ায় টাকা রিফান্ড করা হয়েছে।';
      notes = 'রিফান্ড প্রক্রিয়া সফলভাবে সম্পন্ন হয়েছে।';
    } else {
      // Rejected bookings -> Cancelled payment
      status = 'cancelled';
      paymentMethod = num % 2 === 0 ? 'nagad' : 'bkash';
      transactionId = `CNL${60000 + num}`;
      paymentDate = booking.startDate;
      notes =
        'গাড়ি অনুপলব্ধ থাকায় বুকিং প্রত্যাখ্যান ও ট্রানজেকশন বাতিল করা হয়েছে।';
    }

    await Payment.create({
      paymentId,
      booking: booking._id,
      rental: rental ? rental._id : null,
      customer: booking.customer,
      amount,
      paymentMethod,
      transactionId,
      paymentDate,
      status,
      notes,
      confirmedAt,
      refundedAt,
      refundReason,
    });

    created++;
  }

  console.log(
    `Payments seeded: ${created} created, ${skipped} skipped (already existed).`
  );
};

module.exports = seedPayments;


