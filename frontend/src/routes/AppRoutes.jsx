import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CarLoader from '../components/common/CarLoader';
import ProtectedRoute from '../components/common/ProtectedRoute';

// Public / Customer Car Browsing Pages (Lazy Loaded)
const Home = lazy(() => import('../pages/public/Home'));
const Services = lazy(() => import('../pages/public/Services'));
const About = lazy(() => import('../pages/public/About'));
const Contact = lazy(() => import('../pages/public/Contact'));
const Login = lazy(() => import('../pages/auth/Login'));
const AdminLogin = lazy(() => import('../pages/auth/AdminLogin'));
const Register = lazy(() => import('../pages/auth/Register'));
const PublicCars = lazy(() => import('../pages/public/Cars'));
const PublicCarDetails = lazy(() => import('../pages/public/CarDetails'));

// Customer Pages (Lazy Loaded)
const CustomerDashboard = lazy(() => import('../pages/customer/Dashboard'));
const CreateBooking = lazy(() => import('../pages/customer/CreateBooking'));
const CustomerBookings = lazy(() => import('../pages/customer/Bookings'));
const CustomerBookingDetails = lazy(() => import('../pages/customer/BookingDetails'));
const CustomerPayments = lazy(() => import('../pages/customer/Payments'));
const CreatePayment = lazy(() => import('../pages/customer/CreatePayment'));
const CustomerPaymentDetails = lazy(() => import('../pages/customer/PaymentDetails'));
const CustomerMyRentals = lazy(() => import('../pages/customer/MyRentals'));
const CustomerRentalDetails = lazy(() => import('../pages/customer/RentalDetails'));
const CustomerReviews = lazy(() => import('../pages/customer/Reviews'));
const CreateReview = lazy(() => import('../pages/customer/CreateReview'));
const CustomerReviewDetails = lazy(() => import('../pages/customer/ReviewDetails'));

// Driver Pages (Lazy Loaded)
const DriverDashboard = lazy(() => import('../pages/driver/Dashboard'));
const DriverEditProfile = lazy(() => import('../pages/driver/EditProfile'));
const DriverBookings = lazy(() => import('../pages/driver/Bookings'));

// Admin Pages (Lazy Loaded)
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));
const AdminCars = lazy(() => import('../pages/admin/Cars'));
const AdminDrivers = lazy(() => import('../pages/admin/Drivers'));
const AdminAddCar = lazy(() => import('../pages/admin/AddCar'));
const AdminCarDetails = lazy(() => import('../pages/admin/CarDetails'));
const AdminEditCar = lazy(() => import('../pages/admin/EditCar'));
const AdminBookings = lazy(() => import('../pages/admin/Bookings'));
const AdminBookingDetails = lazy(() => import('../pages/admin/BookingDetails'));
const AdminPayments = lazy(() => import('../pages/admin/Payments'));
const AdminPaymentDetails = lazy(() => import('../pages/admin/PaymentDetails'));
const AdminRentals = lazy(() => import('../pages/admin/Rentals'));
const CreateRental = lazy(() => import('../pages/admin/CreateRental'));
const AdminRentalDetails = lazy(() => import('../pages/admin/RentalDetails'));
const AdminReviews = lazy(() => import('../pages/admin/Reviews'));
const AdminMessages = lazy(() => import('../pages/admin/Messages'));

// Common Pages (Lazy Loaded)
const NotificationsPage = lazy(() => import('../pages/common/Notifications'));

const AppRoutes = () => {
  return (
    <Suspense fallback={<CarLoader />}>
      <Routes>
        {/* Public / Customer Car Browsing Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cars" element={<PublicCars />} />
        <Route path="/cars/:id" element={<PublicCarDetails />} />

        {/* Common Authenticated Routes */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        {/* Customer Routes */}
        <Route
          path="/customer/dashboard"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/bookings/new"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CreateBooking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/bookings"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/bookings/:id"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerBookingDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/payments/new"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CreatePayment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/payments"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerPayments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/payments/:id"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerPaymentDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/rentals"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerMyRentals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/rentals/:id"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerRentalDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/reviews/new"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CreateReview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/reviews"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerReviews />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/reviews/:id"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerReviewDetails />
            </ProtectedRoute>
          }
        />

        {/* Driver Routes */}
        <Route
          path="/driver/dashboard"
          element={
            <ProtectedRoute allowedRoles={['driver']}>
              <DriverDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/driver/bookings"
          element={
            <ProtectedRoute allowedRoles={['driver']}>
              <DriverBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/driver/profile/edit"
          element={
            <ProtectedRoute allowedRoles={['driver']}>
              <DriverEditProfile />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/drivers"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDrivers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/cars"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminCars />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/cars/add"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminAddCar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/cars/:id"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminCarDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/cars/:id/edit"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminEditCar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/bookings/:id"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminBookingDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPayments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/payments/:id"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPaymentDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/rentals"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminRentals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/rentals/new"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <CreateRental />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/rentals/:id"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminRentalDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reviews"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminReviews />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/messages"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminMessages />
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
