const Rental = require('../models/Rental');
const Booking = require('../models/Booking');

const seedRentals = async () => {
  const bookings = await Booking.find({}).sort({ bookingId: 1 });

  if (bookings.length === 0) {
    console.log('Dependencies missing (Bookings required). Skipping rentals seed.');
    return;
  }

  let created = 0;
  let skipped = 0;

  // Pre-fetch existing rentalIds into a Set for fast idempotency checks
  const existingRentalIds = new Set(
    (await Rental.find({}, 'rentalId').lean()).map((r) => r.rentalId)
  );

  // Create realistic Rental records for bookings BK-2026-0001 through BK-2026-0075 (75 rentals total)
  const rentalsToCreate = bookings.filter((b) => {
    const num = parseInt(b.bookingId.replace('BK-2026-', ''), 10);
    return num >= 1 && num <= 75;
  });

  for (const booking of rentalsToCreate) {
    const num = parseInt(booking.bookingId.replace('BK-2026-', ''), 10);
    const rentalId = `RNT-2026-${String(num).padStart(4, '0')}`;

    // Idempotency check: skip if rental already exists
    if (existingRentalIds.has(rentalId)) {
      skipped++;
      continue;
    }

    let status = 'scheduled';
    let actualReturnDate = null;
    let startMileage = 35000 + num * 140;
    let endMileage = null;
    let startFuelLevel = 100;
    let endFuelLevel = null;
    let additionalCharges = 0;
    let discount = num % 5 === 0 ? 500 : 0;
    let damageReport = null;
    let notes = null;

    if (num <= 45) {
      // Completed rentals (from completed bookings)
      status = 'completed';
      actualReturnDate = new Date(
        booking.endDate.getTime() + (num % 3 === 0 ? 7200000 : 0)
      );
      endMileage = startMileage + booking.rentalDays * (120 + (num % 50));
      startFuelLevel = 100;
      endFuelLevel = num % 4 === 0 ? 90 : 100;
      additionalCharges = num % 7 === 0 ? 1000 : num % 3 === 0 ? 500 : 0;
      damageReport =
        num % 7 === 0 ? 'বাম পাশের বাম্পারে সামান্য আঁচড় পাওয়া গেছে।' : null;
      notes =
        'ট্রিপ সফলভাবে সম্পন্ন হয়েছে এবং গাড়ি সুন্দর অবস্থায় ফেরত দেওয়া হয়েছে।';
    } else if (num <= 58) {
      // Active rentals (ongoing)
      status = 'active';
      startFuelLevel = 100;
      notes = 'গাড়ি গ্রাহকের নিকট হস্তান্তরিত হয়েছে, ট্রিপ চলমান রয়েছে।';
    } else if (num <= 60) {
      // Overdue rentals
      status = 'overdue';
      startFuelLevel = 100;
      notes =
        'নির্ধারিত সময় অতিক্রান্ত হয়েছে, গ্রাহকের সাথে যোগাযোগ করা হচ্ছে।';
    } else if (num <= 70) {
      // Scheduled rentals (upcoming)
      status = 'scheduled';
      notes = 'আগামী যাত্রার জন্য গাড়ি প্রস্তুত রাখা হয়েছে।';
    } else if (num <= 75) {
      // Cancelled rentals
      status = 'cancelled';
      notes = 'বুকিং বাতিলের কারণে রেন্টাল চুক্তি বাতিল করা হয়েছে।';
    }

    const rentalAmount = booking.totalAmount;
    const finalAmount = rentalAmount + additionalCharges - discount;

    await Rental.create({
      rentalId,
      booking: booking._id,
      customer: booking.customer,
      car: booking.car,
      driver: booking.driver || null,
      startDate: booking.startDate,
      expectedReturnDate: booking.endDate,
      actualReturnDate,
      startMileage,
      endMileage,
      startFuelLevel,
      endFuelLevel,
      rentalAmount,
      additionalCharges,
      discount,
      finalAmount,
      status,
      damageReport,
      notes,
    });

    created++;
  }

  console.log(
    `Rentals seeded: ${created} created, ${skipped} skipped (already existed).`
  );
};

module.exports = seedRentals;


