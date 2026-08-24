const User = require('../models/User');
const Customer = require('../models/Customer');
const Driver = require('../models/Driver');
const Car = require('../models/Car');
const Booking = require('../models/Booking');
const Rental = require('../models/Rental');
const Payment = require('../models/Payment');
const Maintenance = require('../models/Maintenance');
const Review = require('../models/Review');
const Notification = require('../models/Notification');

/**
 * @desc    Get Admin Dashboard Summary Statistics
 * @route   GET /api/admin/dashboard-summary
 * @access  Private (Admin only)
 */
const getDashboardSummary = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalCustomers,
      totalDrivers,
      totalCars,
      totalBookings,
      totalRentals,
      totalPayments,
      totalMaintenance,
      totalReviews,
      totalNotifications,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      availableCars,
      rentedCars,
      activeRentals,
      pendingPayments,
    ] = await Promise.all([
      User.countDocuments(),
      Customer.countDocuments(),
      Driver.countDocuments(),
      Car.countDocuments(),
      Booking.countDocuments(),
      Rental.countDocuments(),
      Payment.countDocuments(),
      Maintenance.countDocuments(),
      Review.countDocuments(),
      Notification.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.countDocuments({ status: 'completed' }),
      Car.countDocuments({ status: 'available' }),
      Car.countDocuments({ status: 'rented' }),
      Rental.countDocuments({ status: 'active' }),
      Payment.countDocuments({ status: 'pending' }),
    ]);

    return res.status(200).json({
      success: true,
      message: 'ড্যাশবোর্ড সামারি তথ্য সফলভাবে পাওয়া গেছে।',
      data: {
        counts: {
          totalUsers,
          totalCustomers,
          totalDrivers,
          totalCars,
          totalBookings,
          totalRentals,
          totalPayments,
          totalMaintenance,
          totalReviews,
          totalNotifications,
        },
        statusBreakdown: {
          pendingBookings,
          confirmedBookings,
          completedBookings,
          availableCars,
          rentedCars,
          activeRentals,
          pendingPayments,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
};
