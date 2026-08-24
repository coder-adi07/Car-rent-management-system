const Notification = require('../models/Notification');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Rental = require('../models/Rental');
const Customer = require('../models/Customer');
const Driver = require('../models/Driver');

const seedNotifications = async () => {
  const users = await User.find({}).sort({ role: 1, email: 1 });
  const bookings = await Booking.find({}).sort({ bookingId: 1 });
  const rentals = await Rental.find({}).sort({ rentalId: 1 });
  const customers = await Customer.find({}).lean();
  const drivers = await Driver.find({}).lean();

  if (users.length === 0) {
    console.log(
      'Dependencies missing (Users required). Skipping notifications seed.'
    );
    return;
  }

  let created = 0;
  let skipped = 0;

  // Pre-fetch existing notifications into a Set for fast idempotency checks
  const existingNotifications = await Notification.find(
    {},
    'recipient type title'
  ).lean();
  const existingKeys = new Set(
    existingNotifications.map(
      (n) => `${n.recipient.toString()}_${n.type}_${n.title}`
    )
  );

  const adminUser = users.find((u) => u.role === 'admin') || users[0];

  // Map customer/driver IDs to user IDs for direct user lookups
  const customerUserMap = new Map(
    customers.map((c) => [c._id.toString(), c.user.toString()])
  );
  const driverUserMap = new Map(
    drivers.map((d) => [d._id.toString(), d.user.toString()])
  );

  // Map rentals by booking ID for quick rental lookups
  const rentalsByBookingMap = new Map(
    rentals.map((r) => [r.booking.toString(), r])
  );

  const notificationsToCreate = [];

  // 1. BOOKING NOTIFICATIONS (12 notifications)
  for (let i = 0; i < 12 && i < bookings.length; i++) {
    const booking = bookings[i];
    const customerUserId = customerUserMap.get(booking.customer.toString());
    const driverUserId = booking.driver
      ? driverUserMap.get(booking.driver.toString())
      : null;

    if (customerUserId) {
      notificationsToCreate.push({
        recipient: customerUserId,
        type: 'booking',
        title: `বুকিং নিশ্চিতকরণ (${booking.bookingId})`,
        message: `আপনার বুকিং ${booking.bookingId} সফলভাবে নিশ্চিত করা হয়েছে। ভ্রমণের তারিখ: ${booking.startDate.toISOString().split('T')[0]}।`,
        relatedBooking: booking._id,
        relatedRental: null,
        isRead: i % 2 === 0,
      });
    }

    if (driverUserId && i % 3 === 0) {
      notificationsToCreate.push({
        recipient: driverUserId,
        type: 'booking',
        title: `নতুন অ্যাসাইনমেন্ট (${booking.bookingId})`,
        message: `আপনাকে বুকিং ${booking.bookingId} এর জন্য ড্রাইভার হিসেবে নিয়োগ প্রদান করা হয়েছে।`,
        relatedBooking: booking._id,
        relatedRental: null,
        isRead: i % 4 === 0,
      });
    }
  }

  // 2. PAYMENT NOTIFICATIONS (10 notifications)
  for (let i = 0; i < 10 && i < bookings.length; i++) {
    const booking = bookings[i];
    const customerUserId = customerUserMap.get(booking.customer.toString());

    if (customerUserId) {
      notificationsToCreate.push({
        recipient: customerUserId,
        type: 'payment',
        title: `পেমেন্ট নিশ্চিতকরণ (${booking.bookingId})`,
        message: `বুকিং ${booking.bookingId} এর জন্য ৳${booking.totalAmount.toLocaleString()} পেমেন্ট সফলভাবে গ্রহণ করা হয়েছে।`,
        relatedBooking: booking._id,
        relatedRental: null,
        isRead: true,
      });
    }
  }

  // 3. RENTAL NOTIFICATIONS (10 notifications)
  for (let i = 0; i < 10 && i < rentals.length; i++) {
    const rental = rentals[i];
    const customerUserId = customerUserMap.get(rental.customer.toString());

    if (customerUserId) {
      notificationsToCreate.push({
        recipient: customerUserId,
        type: 'rental',
        title: `রেন্টাল আপডেট (${rental.rentalId})`,
        message: `আপনার রেন্টাল চুক্তি ${rental.rentalId} সক্রিয় করা হয়েছে। শুভ যাত্রা!`,
        relatedBooking: rental.booking,
        relatedRental: rental._id,
        isRead: i % 2 === 0,
      });
    }
  }

  // 4. MAINTENANCE NOTIFICATIONS (10 notifications)
  const driverUsersList = users.filter((u) => u.role === 'driver');
  for (let i = 0; i < 10; i++) {
    const recipient =
      i % 2 === 0
        ? adminUser._id
        : driverUsersList[i % driverUsersList.length]._id;
    notificationsToCreate.push({
      recipient,
      type: 'maintenance',
      title: `গাড়ি রক্ষণাবেক্ষণ আপডেট #${i + 1}`,
      message: `যানবাহনের ইনস্পেকশন ও রুটিন রক্ষণাবেক্ষণ কার্যক্রম সফলভাবে সম্পন্ন করা হয়েছে।`,
      relatedBooking: null,
      relatedRental: null,
      isRead: i % 3 !== 0,
    });
  }

  // 5. REVIEW NOTIFICATIONS (8 notifications)
  for (let i = 0; i < 8 && i < bookings.length; i++) {
    const booking = bookings[i];
    const driverUserId = booking.driver
      ? driverUserMap.get(booking.driver.toString())
      : adminUser._id;

    notificationsToCreate.push({
      recipient: driverUserId || adminUser._id,
      type: 'review',
      title: `নতুন রিভিউ প্রাপ্তি (${booking.bookingId})`,
      message: `একজন গ্রাহক বুকিং ${booking.bookingId} এর জন্য নতুন মতামত ও রেটিং প্রদান করেছেন।`,
      relatedBooking: booking._id,
      relatedRental: null,
      isRead: i % 2 === 0,
    });
  }

  // 6. SYSTEM NOTIFICATIONS (10 notifications)
  const customerUsersList = users.filter((u) => u.role === 'customer');
  for (let i = 0; i < 10; i++) {
    const recipient =
      i % 3 === 0
        ? adminUser._id
        : i % 2 === 0
        ? customerUsersList[i % customerUsersList.length]._id
        : driverUsersList[i % driverUsersList.length]._id;

    notificationsToCreate.push({
      recipient,
      type: 'system',
      title: `সিস্টেম নোটিশ #${i + 1}`,
      message: `গাড়ি লাগবে প্লাটফর্মে নতুন ফিচার যুক্ত হয়েছে এবং সিকিউরিটি আপডেট সম্পন্ন হয়েছে।`,
      relatedBooking: null,
      relatedRental: null,
      isRead: i % 2 === 0,
    });
  }

  // Create notifications idempotently
  for (const item of notificationsToCreate) {
    const key = `${item.recipient.toString()}_${item.type}_${item.title}`;

    if (existingKeys.has(key)) {
      skipped++;
      continue;
    }

    await Notification.create(item);
    existingKeys.add(key);
    created++;
  }

  console.log(
    `Notifications seeded: ${created} created, ${skipped} skipped (already existed).`
  );
};

module.exports = seedNotifications;
