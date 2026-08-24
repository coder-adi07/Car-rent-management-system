const Maintenance = require('../models/Maintenance');
const Car = require('../models/Car');

const serviceProviders = [
  'টয়োটা সার্ভিস সেন্টার - গুলশান',
  'নাভানা অটোমোবাইলস সার্ভিস সেন্টার - তেজগাঁও',
  'রহিম মেকানিক গ্যারেজ - ধোলাইখাল',
  'মেঘনা অটো সার্ভিস - উত্তরা',
  'সানরাইজ অটো ওয়ার্কশপ - আগ্রাবাদ, চট্টগ্রাম',
  'হন্ডা অটো কেয়ার - বনানী',
  'রয়েল অটো গ্যারেজ - মিরপুর',
  'পদ্মা সার্ভিসিং সেন্টার - মতিঝিল',
];

const seedMaintenance = async () => {
  const cars = await Car.find({}).sort({ registrationNumber: 1 });

  if (cars.length === 0) {
    console.log(
      'Dependencies missing (Cars required). Skipping maintenance seed.'
    );
    return;
  }

  let created = 0;
  let skipped = 0;

  // Pre-fetch existing maintenanceIds into a Set for fast idempotency checks
  const existingMaintenanceIds = new Set(
    (await Maintenance.find({}, 'maintenanceId').lean()).map(
      (m) => m.maintenanceId
    )
  );

  // Generate 50 realistic maintenance records covering all 35 cars
  const totalMaintenanceRecords = 50;

  for (let i = 1; i <= totalMaintenanceRecords; i++) {
    const maintenanceId = `MNT-2026-${String(i).padStart(4, '0')}`;

    // Idempotency check: skip if maintenance record already exists
    if (existingMaintenanceIds.has(maintenanceId)) {
      skipped++;
      continue;
    }

    const car = cars[(i - 1) % cars.length];
    const provider = serviceProviders[(i - 1) % serviceProviders.length];

    // Distribute service types evenly across all 8 supported enum values
    let serviceType = 'routine';
    let partsReplaced = [];
    let description = '';
    let notes = '';

    const typeMod = i % 8;
    if (typeMod === 1) {
      serviceType = 'oil_change';
      partsReplaced = ['ইঞ্জিন অয়েল (মোবিল ১)', 'অয়েল ফিল্টার'];
      description = 'নিয়মিত ১০,০০০ কিমি চলাচলের পর ইঞ্জিন অয়েল ও ফিল্টার পরিবর্তন।';
      notes = 'ইঞ্জিনের মসৃণ পারফরম্যান্স বজায় রাখতে আগামী ৫,০০০ কিমি পর আবার চেকআপের পরামর্শ।';
    } else if (typeMod === 2) {
      serviceType = 'routine';
      partsReplaced = ['এয়ার ফিল্টার', 'এসি ফিল্টার', 'স্পার্ক প্লাগ'];
      description = 'গাড়ির সার্বিক রুটিন চেকআপ, ফ্লুইড টপ-আপ এবং ফিল্টার ক্লিন।';
      notes = 'রুটিন চেকআপে কোনো প্রধান ত্রুটি পাওয়া যায়নি, গাড়ি সম্পূর্ণ প্রস্তুত।';
    } else if (typeMod === 3) {
      serviceType = 'brake';
      partsReplaced = ['সামনের ব্রেক প্যাড', 'ব্রেক ফ্লুইড (DOT 4)'];
      description = 'ব্রেক সিগন্যালে শব্দ হওয়ায় ফ্রন্ট ব্রেক প্যাড পরিবর্তন ও ক্যালিপার সার্ভিস।';
      notes = 'নতুন ব্রেক প্যাড ইন্সটল করা হয়েছে, পেডাল রেসপন্স অত্যন্ত ভালো।';
    } else if (typeMod === 4) {
      serviceType = 'tire';
      partsReplaced = ['ব্রিজস্টোন টায়ার ২ টি', 'হুইল অ্যালাইনমেন্ট ওয়েট'];
      description = 'সামনের দুটি টায়ার পরিবর্তন এবং হুইল অ্যালাইনমেন্ট ও ব্যালেন্সিং।';
      notes = 'টায়ার প্রেসার ৩৩ PSI তে সেট করা হয়েছে।';
    } else if (typeMod === 5) {
      serviceType = 'engine';
      partsReplaced = ['টাইমিং বেল্ট', 'ইঞ্জিন মাউন্টিং রবার'];
      description = 'ইঞ্জিনে হালকা ভাইব্রেশনের জন্য ওভারহোলিং ও মাউন্টিং রিপ্লেসমেন্ট।';
      notes = 'ভাইব্রেশন সম্পূর্ণ দূর হয়েছে, ইঞ্জিন সাউন্ড স্বাভাবিক।';
    } else if (typeMod === 6) {
      serviceType = 'electrical';
      partsReplaced = ['হামকো ১২ ভোল্ট ব্যাটারি', 'হেডলাইট বাল্ব'];
      description = 'স্টার্ট নিতে সমস্যা হওয়ায় নতুন ব্যাটারি স্থাপন ও ওয়ারিং চেকআপ।';
      notes = 'ব্যাটারির ১৮ মাসের ওয়ারেন্টি কার্ড ডকুমেন্টের সাথে যুক্ত।';
    } else if (typeMod === 7) {
      serviceType = 'bodywork';
      partsReplaced = ['বাম পাশের বাম্পার পেন্টিং', 'ডেন্ট রিমুভাল'];
      description = 'বাম পাশের ডেন্ট রিমুভ ও হাই-কোয়ালিটি কালার ম্যাচিং ডেন্ট-পেন্ট।';
      notes = 'বডি পলিশিং সম্পন্ন করে ঝকঝকে ফিনিশিং দেওয়া হয়েছে।';
    } else {
      serviceType = 'other';
      partsReplaced = ['ওয়াইপার ব্লেড সেট', 'কুল্যান্ট ফ্লুইড'];
      description = 'উইন্ডশিল্ড ওয়াইপার বদল ও কুল্যান্ট চেঞ্জ সার্ভিস।';
      notes = 'বৃষ্টির দিনে দৃশ্যমানতা নিশ্চিত করতে প্রিমিয়াম ওয়াইপার বসানো হয়েছে।';
    }

    // Distribute status values across scheduled, in_progress, completed, cancelled
    let status = 'completed';
    let serviceDate;
    let completedDate = null;
    let nextServiceDate = null;

    if (i <= 32) {
      // Completed maintenance (Past dates)
      status = 'completed';
      const daysAgo = (33 - i) * 5;
      serviceDate = new Date(
        Date.now() - (daysAgo + 1) * 24 * 60 * 60 * 1000
      );
      completedDate = new Date(
        serviceDate.getTime() + 8 * 60 * 60 * 1000
      ); // 8 hours later
      nextServiceDate = new Date(
        serviceDate.getTime() + 180 * 24 * 60 * 60 * 1000
      ); // 6 months later
    } else if (i <= 38) {
      // In progress maintenance
      status = 'in_progress';
      serviceDate = new Date();
      completedDate = null;
      nextServiceDate = null;
    } else if (i <= 46) {
      // Scheduled maintenance (Future dates)
      status = 'scheduled';
      const daysAhead = (i - 38) * 4;
      serviceDate = new Date(
        Date.now() + daysAhead * 24 * 60 * 60 * 1000
      );
      completedDate = null;
      nextServiceDate = null;
    } else {
      // Cancelled maintenance
      status = 'cancelled';
      serviceDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
      completedDate = null;
      nextServiceDate = null;
      notes = 'পার্টস স্টকে না থাকায় এবং গ্রাহকের তাড়া থাকায় সার্ভিসিং স্থগিত করা হয়েছে।';
    }

    const mileage = (car.currentMileage || 45000) + i * 150;
    const cost = status === 'cancelled' ? 0 : 2500 + (i % 7) * 4500;

    await Maintenance.create({
      maintenanceId,
      car: car._id,
      serviceType,
      description,
      serviceDate,
      completedDate,
      mileage,
      cost,
      serviceProvider: provider,
      status,
      partsReplaced,
      notes,
      nextServiceDate,
    });

    created++;
  }

  console.log(
    `Maintenance seeded: ${created} created, ${skipped} skipped (already existed).`
  );
};

module.exports = seedMaintenance;
