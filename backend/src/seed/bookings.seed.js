const Booking = require('../models/Booking');
const Customer = require('../models/Customer');
const Car = require('../models/Car');
const Driver = require('../models/Driver');

const routes = [
  {
    pickup: { address: 'বাড়ি ১২, রোড ৭, ধানমন্ডি', city: 'ঢাকা', district: 'ঢাকা', coordinates: { lat: 23.7465, lng: 90.376 } },
    dropoff: { address: 'জিইসি মোড়, ওআর নিজাম রোড', city: 'চট্টগ্রাম', district: 'চট্টগ্রাম', coordinates: { lat: 22.3569, lng: 91.8225 } },
  },
  {
    pickup: { address: 'উত্তরা সেক্টর ৩, জসিমউদ্দিন এভিনিউ', city: 'ঢাকা', district: 'ঢাকা', coordinates: { lat: 23.8759, lng: 90.3995 } },
    dropoff: { address: 'কলাতলী বিচ রোড', city: 'কক্সবাজার', district: 'কক্সবাজার', coordinates: { lat: 21.4272, lng: 91.9798 } },
  },
  {
    pickup: { address: 'গুলশান ২, কামাল আতাতুর্ক এভিনিউ', city: 'ঢাকা', district: 'ঢাকা', coordinates: { lat: 23.7937, lng: 90.4137 } },
    dropoff: { address: 'জিন্দাবাজার পয়েন্ট', city: 'সিলেট', district: 'সিলেট', coordinates: { lat: 24.8949, lng: 91.8687 } },
  },
  {
    pickup: { address: 'মিরপুর ১০ গোলচত্বর', city: 'ঢাকা', district: 'ঢাকা', coordinates: { lat: 23.8071, lng: 90.3686 } },
    dropoff: { address: 'সাহেব বাজার জিরো পয়েন্ট', city: 'রাজশাহী', district: 'রাজশাহী', coordinates: { lat: 24.3636, lng: 88.6284 } },
  },
  {
    pickup: { address: 'মতিঝিল বাণিজ্যিক এলাকা', city: 'ঢাকা', district: 'ঢাকা', coordinates: { lat: 23.733, lng: 90.4175 } },
    dropoff: { address: 'শিববাড়ি মোড়', city: 'খুলনা', district: 'খুলনা', coordinates: { lat: 22.8157, lng: 89.5681 } },
  },
  {
    pickup: { address: 'বসুন্ধরা আবাসিক এলাকা, ব্লক সি', city: 'ঢাকা', district: 'ঢাকা', coordinates: { lat: 23.8151, lng: 90.4326 } },
    dropoff: { address: 'সদরঘাট লঞ্চ টার্মিনাল রোড', city: 'বরিশাল', district: 'বরিশাল', coordinates: { lat: 22.701, lng: 90.3535 } },
  },
  {
    pickup: { address: 'বনানী ১১ নম্বর রোড', city: 'ঢাকা', district: 'ঢাকা', coordinates: { lat: 23.7942, lng: 90.4044 } },
    dropoff: { address: 'সাতমাথা মোড়', city: 'বগুড়া', district: 'বগুড়া', coordinates: { lat: 24.8465, lng: 89.373 } },
  },
  {
    pickup: { address: 'মহাখালী বাস টার্মিনাল এলাকা', city: 'ঢাকা', district: 'ঢাকা', coordinates: { lat: 23.7776, lng: 90.4005 } },
    dropoff: { address: 'গাঙ্গিনার পাড়', city: 'ময়মনসিংহ', district: 'ময়মনসিংহ', coordinates: { lat: 24.7576, lng: 90.4073 } },
  },
  {
    pickup: { address: 'আগ্রাবাদ বাণিজ্যিক এলাকা', city: 'চট্টগ্রাম', district: 'চট্টগ্রাম', coordinates: { lat: 22.3274, lng: 91.8124 } },
    dropoff: { address: 'ইনানী বিচ', city: 'কক্সবাজার', district: 'কক্সবাজার', coordinates: { lat: 21.1856, lng: 92.0528 } },
  },
  {
    pickup: { address: 'আম্বরখানা পয়েন্ট', city: 'সিলেট', district: 'সিলেট', coordinates: { lat: 24.9045, lng: 91.8682 } },
    dropoff: { address: 'শ্রীমঙ্গল চা বাগান রিসোর্ট', city: 'মৌলভীবাজার', district: 'মৌলভীবাজার', coordinates: { lat: 24.3065, lng: 91.7296 } },
  },
  {
    pickup: { address: 'ধানমন্ডি ২৭', city: 'ঢাকা', district: 'ঢাকা', coordinates: { lat: 23.7533, lng: 90.3769 } },
    dropoff: { address: 'হযরত শাহজালাল আন্তর্জাতিক বিমানবন্দর', city: 'ঢাকা', district: 'ঢাকা', coordinates: { lat: 23.8434, lng: 90.403 } },
  },
  {
    pickup: { address: 'কাকরাইল মোড়', city: 'ঢাকা', district: 'ঢাকা', coordinates: { lat: 23.7388, lng: 90.4086 } },
    dropoff: { address: 'শাসনগাছা বাস টার্মিনাল', city: 'কুমিল্লা', district: 'কুমিল্লা', coordinates: { lat: 23.4682, lng: 91.1788 } },
  },
  {
    pickup: { address: 'নিউ মার্কেট এরিয়া', city: 'রাজশাহী', district: 'রাজশাহী', coordinates: { lat: 24.3707, lng: 88.5974 } },
    dropoff: { address: 'নাটোর রাজবাড়ি রোড', city: 'নাটোর', district: 'নাটোর', coordinates: { lat: 24.4102, lng: 88.9796 } },
  },
  {
    pickup: { address: 'সোনাডাঙ্গা বাস স্ট্যান্ড', city: 'খুলনা', district: 'খুলনা', coordinates: { lat: 22.8258, lng: 89.5406 } },
    dropoff: { address: 'মোংলা পোর্ট এলাকা', city: 'বাগেরহাট', district: 'বাগেরহাট', coordinates: { lat: 22.4833, lng: 89.6 } },
  },
  {
    pickup: { address: 'নথুল্লাবাদ বাস টার্মিনাল', city: 'বরিশাল', district: 'বরিশাল', coordinates: { lat: 22.7167, lng: 90.35 } },
    dropoff: { address: 'কুয়াকাটা সমুদ্র সৈকত', city: 'পটুয়াখালী', district: 'পটুয়াখালী', coordinates: { lat: 21.8167, lng: 90.1167 } },
  },
  {
    pickup: { address: 'জাহাজ কোম্পানি মোড়', city: 'রংপুর', district: 'রংপুর', coordinates: { lat: 25.7439, lng: 89.2752 } },
    dropoff: { address: 'দিনাজপুর রাজবাড়ি রোড', city: 'দিনাজপুর', district: 'দিনাজপুর', coordinates: { lat: 25.6217, lng: 88.6355 } },
  },
];

const specialRequests = [
  'লাগেজ বেশি থাকবে, রুফ ক্যারিয়ার থাকা জরুরি।',
  'পরিবারে বৃদ্ধ ও শিশু আছে, আরামদায়ক রাইড ও এসি ভালো হওয়া প্রয়োজন।',
  'জরুরি অফিসিয়াল মিটিং, ড্রাইভার যেন নির্ধারিত সময়ের ১৫ মিনিট আগে উপস্থিত থাকেন।',
  'পারিবারিক ভ্রমণ, শান্ত ও অভিজ্ঞ চালক প্রয়োজন।',
  'বিমানবন্দরে পৌঁছাতে হবে, ট্রাফিকের কারণে সকাল সকাল রওনা দিতে হবে।',
  'ধূমপানমুক্ত পরিষ্কার গাড়ি প্রয়োজন।',
  'লং ট্যুর, গাড়ির সাউন্ড সিস্টেম ও মোবাইল চার্জার ভালো থাকা লাগবে।',
  null,
  null,
  null,
];

const cancellationReasons = [
  'গ্রাহকের জরুরি পারিবারিক কারণে সফর বাতিল করা হয়েছে।',
  'পরিকল্পনা পরিবর্তন হওয়ায় বুকিং বাতিল করা হয়েছে।',
  'অফিসের মিটিং পিছিয়ে যাওয়ার কারণে গ্রাহক বুকিং বাতিল করেছেন।',
  'নির্ধারিত তারিখে কাঙ্ক্ষিত গাড়িটি রক্ষণাবেক্ষণে থাকায় বুকিং বাতিল হয়েছে।',
  'আবহাওয়া খারাপ থাকায় ট্যুর স্থগিত করা হয়েছে।',
];

const seedBookings = async () => {
  const customers = await Customer.find({});
  const cars = await Car.find({});
  const drivers = await Driver.find({});

  if (customers.length === 0 || cars.length === 0 || drivers.length === 0) {
    console.log('Dependencies missing (Customers/Cars/Drivers required). Skipping bookings seed.');
    return;
  }

  let created = 0;
  let skipped = 0;

  const totalBookingsToCreate = 100;

  for (let i = 1; i <= totalBookingsToCreate; i++) {
    const bookingId = `BK-2026-${String(i).padStart(4, '0')}`;

    // Duplicate check by unique bookingId
    const existingBooking = await Booking.findOne({ bookingId });
    if (existingBooking) {
      skipped++;
      continue;
    }

    const customer = customers[(i - 1) % customers.length];
    const car = cars[(i - 1) % cars.length];
    const driver = drivers[(i - 1) % drivers.length];
    const route = routes[(i - 1) % routes.length];

    // Rental duration between 1 to 5 days
    const rentalDays = ((i % 5) + 1);
    const dailyRate = car.dailyRentalPrice || 3500;
    const totalAmount = rentalDays * dailyRate;

    // Status distribution:
    // 1-45: completed
    // 46-70: confirmed
    // 71-85: pending
    // 86-95: cancelled
    // 96-100: rejected
    let status = 'pending';
    let assignedDriver = null;
    let driverRequired = (i % 6 !== 0); // 85% bookings require driver
    let confirmedAt = null;
    let cancelledAt = null;
    let completedAt = null;
    let cancellationReason = null;

    const baseDate = new Date('2026-08-01T09:00:00.000Z');
    let startDate;
    let endDate;

    if (i <= 45) {
      // Completed (Past dates in early/mid August 2026)
      status = 'completed';
      assignedDriver = driverRequired ? driver._id : null;
      startDate = new Date(baseDate.getTime() + (i * 86400000 * 0.3));
      endDate = new Date(startDate.getTime() + (rentalDays * 86400000));
      confirmedAt = new Date(startDate.getTime() - 86400000);
      completedAt = new Date(endDate.getTime() + 7200000);
    } else if (i <= 70) {
      // Confirmed (Ongoing / near upcoming dates)
      status = 'confirmed';
      assignedDriver = driverRequired ? driver._id : null;
      startDate = new Date(baseDate.getTime() + (18 * 86400000) + ((i - 45) * 86400000 * 0.4));
      endDate = new Date(startDate.getTime() + (rentalDays * 86400000));
      confirmedAt = new Date(startDate.getTime() - 86400000);
    } else if (i <= 85) {
      // Pending (Future dates)
      status = 'pending';
      assignedDriver = null;
      startDate = new Date(baseDate.getTime() + (25 * 86400000) + ((i - 70) * 86400000 * 0.5));
      endDate = new Date(startDate.getTime() + (rentalDays * 86400000));
    } else if (i <= 95) {
      // Cancelled
      status = 'cancelled';
      assignedDriver = null;
      startDate = new Date(baseDate.getTime() + (10 * 86400000) + ((i - 85) * 86400000 * 0.5));
      endDate = new Date(startDate.getTime() + (rentalDays * 86400000));
      cancelledAt = new Date(startDate.getTime() - 43200000);
      cancellationReason = cancellationReasons[(i - 86) % cancellationReasons.length];
    } else {
      // Rejected
      status = 'rejected';
      assignedDriver = null;
      startDate = new Date(baseDate.getTime() + (12 * 86400000) + ((i - 95) * 86400000 * 0.5));
      endDate = new Date(startDate.getTime() + (rentalDays * 86400000));
      cancelledAt = new Date(startDate.getTime() - 3600000);
      cancellationReason = cancellationReasons[(i - 96) % cancellationReasons.length];
    }

    const specialRequest = specialRequests[(i - 1) % specialRequests.length];

    await Booking.create({
      bookingId,
      customer: customer._id,
      car: car._id,
      driver: assignedDriver,
      pickupLocation: route.pickup,
      dropoffLocation: route.dropoff,
      startDate,
      endDate,
      rentalDays,
      dailyRate,
      totalAmount,
      driverRequired,
      specialRequest,
      status,
      cancellationReason,
      confirmedAt,
      cancelledAt,
      completedAt,
    });

    created++;
  }

  console.log(`Bookings seeded: ${created} created, ${skipped} skipped (already existed).`);
};

module.exports = seedBookings;
