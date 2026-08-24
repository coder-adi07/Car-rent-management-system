const Review = require('../models/Review');
const Booking = require('../models/Booking');

const reviewCommentsByRating = {
  5: [
    'গাড়িটি অত্যন্ত নিখুঁত ও পরিষ্কার ছিল। ড্রাইভার ভাইয়ের ব্যবহার অনেক ভালো ছিল, সময়মত গন্তব্যে পৌঁছে দিয়েছেন।',
    'চমৎকার সার্ভিস! এসির কুলিং খুব ভালো ছিল এবং দীর্ঘ যাত্রায় কোনো ক্লান্তি অনুভব হয়নি। আগামীতেও নিব।',
    'খুবই সুন্দর অভিজ্ঞতা! গাড়ির পারফরম্যান্স দারুণ ছিল। ধন্যবাদ টিম গাড়ি লাগবে।',
    'ফ্যামিলি ট্রিপের জন্য গাড়িটি নিয়েছিলাম। অত্যন্ত নিরাপদ ও আরামদায়ক রাইড ছিল।',
    'আমাদের অফিসিয়াল ট্যুরে ড্রাইভার সাহেবের সময়ানুবর্তিতা এবং পেশাদার আচরণ মুগ্ধ করেছে।',
  ],
  4: [
    'সার্ভিস সার্বিকভাবে বেশ ভালো ছিল। গাড়ি পরিষ্কার ছিল, তবে ট্রাফিকের কারণে কিছুটা দেরি হয়েছিল।',
    'সুন্দর ড্রাইভ ও ভালো এসি সার্ভিস। টুকটাক ছোট কিছু বিষয় ছাড়া চমৎকার ভ্রমণ।',
    'গাড়ির কন্ডিশন ভালো ছিল। চালক অভিজ্ঞ ছিলেন। আগামীতে আবার বুকিং করার ইচ্ছা আছে।',
    'স্বল্প খরচে অনেক ভালো সাপোর্ট পেয়েছি। রাইড বেশ স্মুথ ছিল।',
  ],
  3: [
    'রাইড ঠিকঠাক ছিল, তবে গাড়ির ভেতরে সামান্য ধুলোবালি ছিল। পরিষ্কার-পরিচ্ছন্নতায় আরেকটু নজর দেওয়া দরকার।',
    'ড্রাইভার ভালো ড্রাইভ করেছেন, কিন্তু স্পিকার কাজ করছিল না ট্রিপের সময়।',
    'গাড়ি চালনায় কোনো সমস্যা ছিল না, তবে যাত্রা শুরুর নির্ধারিত সময়ের ১০ মিনিট পরে চালক পৌঁছেছেন।',
  ],
  2: [
    'ড্রাইভার নির্ধারিত সময়ের ১৫ মিনিট দেরিতে এসেছেন। গাড়ির এসি খুব বেশি ঠান্ডা হচ্ছিল না।',
    'দীর্ঘ পথের যাত্রায় গাড়িতে হালকা শব্দ হচ্ছিল। সার্ভিসিং বাড়িয়ে নেওয়া উচিত।',
  ],
  1: [
    'গাড়ির অভ্যন্তরীণ কন্ডিশন আশানুরূপ ছিল না এবং ড্রাইভারের আচরণ মোটেও পেশাদার ছিল না।',
    'রাইডের মাঝে এসি কাজ করা বন্ধ করে দেয়। আমাদের অত্যন্ত ভোগান্তির শিকার হতে হয়েছে।',
  ],
};

const seedReviews = async () => {
  // Fetch completed bookings with populated Customer, Car, and Driver references
  const bookings = await Booking.find({ status: 'completed' })
    .populate('customer car driver')
    .sort({ bookingId: 1 });

  if (bookings.length === 0) {
    console.log(
      'Dependencies missing (Completed Bookings required). Skipping reviews seed.'
    );
    return;
  }

  let created = 0;
  let skipped = 0;

  // Pre-fetch existing review booking IDs into a Set for fast idempotency checks
  const existingBookingIds = new Set(
    (await Review.find({}, 'booking').lean()).map((r) =>
      r.booking.toString()
    )
  );

  // Generate realistic reviews for up to 45 completed bookings
  const bookingsToReview = bookings.slice(0, 45);

  for (let i = 0; i < bookingsToReview.length; i++) {
    const booking = bookingsToReview[i];

    // Idempotency check: skip if review already exists for this booking
    if (existingBookingIds.has(booking._id.toString())) {
      skipped++;
      continue;
    }

    const index = i + 1;

    // Mixture of ratings: 5 (majority), 4, 3, 2, 1
    let rating = 5;
    if (index % 15 === 0) {
      rating = 1;
    } else if (index % 11 === 0) {
      rating = 2;
    } else if (index % 7 === 0) {
      rating = 3;
    } else if (index % 3 === 0) {
      rating = 4;
    } else {
      rating = 5;
    }

    // Pick appropriate Bengali comment for rating
    const commentsList = reviewCommentsByRating[rating];
    const comment = commentsList[i % commentsList.length];

    // Status: 42 published, 3 hidden (e.g. for low rating / flagged reviews)
    const status = (rating <= 2 && index % 2 === 0) ? 'hidden' : 'published';

    await Review.create({
      customer: booking.customer._id || booking.customer,
      car: booking.car ? (booking.car._id || booking.car) : null,
      driver: booking.driver ? (booking.driver._id || booking.driver) : null,
      booking: booking._id,
      rating,
      comment,
      status,
    });

    created++;
  }

  console.log(
    `Reviews seeded: ${created} created, ${skipped} skipped (already existed).`
  );
};

module.exports = seedReviews;
