const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Customer = require('../models/Customer');

// 50 realistic Bangladeshi customer demo records
const customerData = [
  {
    user: { name: 'নাজমুন নাহার', email: 'customer01@gari-lagbe.com', phone: '01811-100001' },
    customer: {
      fullName: 'নাজমুন নাহার', phone: '01811-100001', email: 'customer01@gari-lagbe.com',
      dateOfBirth: new Date('1992-04-10'),
      address: { street: '৫ ধানমন্ডি ৩২', city: 'ঢাকা', district: 'ঢাকা', postalCode: '1209' },
      drivingLicenseNumber: 'CL-DHK-2018-100001', drivingLicenseExpiryDate: new Date('2028-04-30'),
      emergencyContact: { name: 'আরিফুল ইসলাম', phone: '01911-100001', relationship: 'স্বামী' },
      status: 'active',
    },
  },
  {
    user: { name: 'মোহাম্মদ সোহেল রানা', email: 'customer02@gari-lagbe.com', phone: '01811-100002' },
    customer: {
      fullName: 'মোহাম্মদ সোহেল রানা', phone: '01811-100002', email: 'customer02@gari-lagbe.com',
      dateOfBirth: new Date('1988-09-22'),
      address: { street: '৩৪ বনানী রোড', city: 'ঢাকা', district: 'ঢাকা', postalCode: '1213' },
      drivingLicenseNumber: 'CL-DHK-2015-100002', drivingLicenseExpiryDate: new Date('2027-09-30'),
      emergencyContact: { name: 'সুমাইয়া বেগম', phone: '01912-100002', relationship: 'স্ত্রী' },
      status: 'active',
    },
  },
  {
    user: { name: 'ফারহানা আক্তার', email: 'customer03@gari-lagbe.com', phone: '01811-100003' },
    customer: {
      fullName: 'ফারহানা আক্তার', phone: '01811-100003', email: 'customer03@gari-lagbe.com',
      dateOfBirth: new Date('1995-01-15'),
      address: { street: '৮ নিকুঞ্জ ২', city: 'ঢাকা', district: 'ঢাকা', postalCode: '1229' },
      drivingLicenseNumber: null, drivingLicenseExpiryDate: null,
      emergencyContact: { name: 'রুমা বেগম', phone: '01913-100003', relationship: 'মা' },
      status: 'active',
    },
  },
  {
    user: { name: 'রাকিবুল হাসান', email: 'customer04@gari-lagbe.com', phone: '01811-100004' },
    customer: {
      fullName: 'রাকিবুল হাসান', phone: '01811-100004', email: 'customer04@gari-lagbe.com',
      dateOfBirth: new Date('1990-06-18'),
      address: { street: '২১ মহাখালী', city: 'ঢাকা', district: 'ঢাকা', postalCode: '1212' },
      drivingLicenseNumber: 'CL-DHK-2016-100004', drivingLicenseExpiryDate: new Date('2026-06-30'),
      emergencyContact: { name: 'মোহাম্মদ হাসান', phone: '01914-100004', relationship: 'বাবা' },
      status: 'active',
    },
  },
  {
    user: { name: 'শিরিন আক্তার', email: 'customer05@gari-lagbe.com', phone: '01811-100005' },
    customer: {
      fullName: 'শিরিন আক্তার', phone: '01811-100005', email: 'customer05@gari-lagbe.com',
      dateOfBirth: new Date('1993-11-05'),
      address: { street: '৬৭ লালবাগ রোড', city: 'ঢাকা', district: 'ঢাকা', postalCode: '1211' },
      drivingLicenseNumber: null, drivingLicenseExpiryDate: null,
      emergencyContact: { name: 'করিম মিয়া', phone: '01915-100005', relationship: 'ভাই' },
      status: 'active',
    },
  },
  {
    user: { name: 'মোঃ রিয়াদ হোসেন', email: 'customer06@gari-lagbe.com', phone: '01811-100006' },
    customer: {
      fullName: 'মোঃ রিয়াদ হোসেন', phone: '01811-100006', email: 'customer06@gari-lagbe.com',
      dateOfBirth: new Date('1997-03-27'),
      address: { street: '১৪ আজিমপুর', city: 'ঢাকা', district: 'ঢাকা', postalCode: '1205' },
      drivingLicenseNumber: 'CL-DHK-2020-100006', drivingLicenseExpiryDate: new Date('2030-03-31'),
      emergencyContact: { name: 'হোসেন আলী', phone: '01916-100006', relationship: 'বাবা' },
      status: 'active',
    },
  },
  {
    user: { name: 'সামিরা ইসলাম', email: 'customer07@gari-lagbe.com', phone: '01811-100007' },
    customer: {
      fullName: 'সামিরা ইসলাম', phone: '01811-100007', email: 'customer07@gari-lagbe.com',
      dateOfBirth: new Date('1994-08-12'),
      address: { street: '৪৫ পুরান ঢাকা', city: 'ঢাকা', district: 'ঢাকা', postalCode: '1100' },
      drivingLicenseNumber: null, drivingLicenseExpiryDate: null,
      emergencyContact: { name: 'নাসরিন ইসলাম', phone: '01917-100007', relationship: 'মা' },
      status: 'active',
    },
  },
  {
    user: { name: 'মোহাম্মদ আরিফ বিল্লাহ', email: 'customer08@gari-lagbe.com', phone: '01811-100008' },
    customer: {
      fullName: 'মোহাম্মদ আরিফ বিল্লাহ', phone: '01811-100008', email: 'customer08@gari-lagbe.com',
      dateOfBirth: new Date('1986-12-01'),
      address: { street: '৯ বসুন্ধরা রা', city: 'ঢাকা', district: 'ঢাকা', postalCode: '1229' },
      drivingLicenseNumber: 'CL-DHK-2013-100008', drivingLicenseExpiryDate: new Date('2027-12-31'),
      emergencyContact: { name: 'আরেফা বেগম', phone: '01918-100008', relationship: 'স্ত্রী' },
      status: 'active',
    },
  },
  {
    user: { name: 'তাসনিম জাহান', email: 'customer09@gari-lagbe.com', phone: '01811-100009' },
    customer: {
      fullName: 'তাসনিম জাহান', phone: '01811-100009', email: 'customer09@gari-lagbe.com',
      dateOfBirth: new Date('1998-05-20'),
      address: { street: '২২ কলাবাগান', city: 'ঢাকা', district: 'ঢাকা', postalCode: '1207' },
      drivingLicenseNumber: null, drivingLicenseExpiryDate: null,
      emergencyContact: { name: 'তানজিলা বেগম', phone: '01919-100009', relationship: 'বোন' },
      status: 'active',
    },
  },
  {
    user: { name: 'মোঃ সাজ্জাদ হোসেন', email: 'customer10@gari-lagbe.com', phone: '01811-100010' },
    customer: {
      fullName: 'মোঃ সাজ্জাদ হোসেন', phone: '01811-100010', email: 'customer10@gari-lagbe.com',
      dateOfBirth: new Date('1991-07-14'),
      address: { street: '৩৩ মতিঝিল', city: 'ঢাকা', district: 'ঢাকা', postalCode: '1000' },
      drivingLicenseNumber: 'CL-DHK-2017-100010', drivingLicenseExpiryDate: new Date('2027-07-31'),
      emergencyContact: { name: 'সালমা বেগম', phone: '01821-100010', relationship: 'স্ত্রী' },
      status: 'active',
    },
  },
  // Customers 11–20: Chittagong, Sylhet, Rajshahi divisions
  {
    user: { name: 'করিমা বেগম', email: 'customer11@gari-lagbe.com', phone: '01811-100011' },
    customer: {
      fullName: 'করিমা বেগম', phone: '01811-100011', email: 'customer11@gari-lagbe.com',
      dateOfBirth: new Date('1985-02-08'),
      address: { street: '১৭ নাসিরাবাদ', city: 'চট্টগ্রাম', district: 'চট্টগ্রাম', postalCode: '4000' },
      drivingLicenseNumber: 'CL-CTG-2012-100011', drivingLicenseExpiryDate: new Date('2028-02-28'),
      emergencyContact: { name: 'আবুল কাশেম', phone: '01822-100011', relationship: 'স্বামী' },
      status: 'active',
    },
  },
  {
    user: { name: 'মোহাম্মদ নাজিম উদ্দিন', email: 'customer12@gari-lagbe.com', phone: '01811-100012' },
    customer: {
      fullName: 'মোহাম্মদ নাজিম উদ্দিন', phone: '01811-100012', email: 'customer12@gari-lagbe.com',
      dateOfBirth: new Date('1989-10-30'),
      address: { street: '৫৩ হালিশহর', city: 'চট্টগ্রাম', district: 'চট্টগ্রাম', postalCode: '4225' },
      drivingLicenseNumber: 'CL-CTG-2014-100012', drivingLicenseExpiryDate: new Date('2029-10-31'),
      emergencyContact: { name: 'জেবা খানম', phone: '01823-100012', relationship: 'স্ত্রী' },
      status: 'active',
    },
  },
  {
    user: { name: 'আফসানা মিম', email: 'customer13@gari-lagbe.com', phone: '01811-100013' },
    customer: {
      fullName: 'আফসানা মিম', phone: '01811-100013', email: 'customer13@gari-lagbe.com',
      dateOfBirth: new Date('1996-06-25'),
      address: { street: '৬ পাঁচলাইশ', city: 'চট্টগ্রাম', district: 'চট্টগ্রাম', postalCode: '4203' },
      drivingLicenseNumber: null, drivingLicenseExpiryDate: null,
      emergencyContact: { name: 'রুমানা বেগম', phone: '01824-100013', relationship: 'মা' },
      status: 'active',
    },
  },
  {
    user: { name: 'মোঃ ইমরান হোসেন', email: 'customer14@gari-lagbe.com', phone: '01811-100014' },
    customer: {
      fullName: 'মোঃ ইমরান হোসেন', phone: '01811-100014', email: 'customer14@gari-lagbe.com',
      dateOfBirth: new Date('1992-03-11'),
      address: { street: '২৯ খুলশী', city: 'চট্টগ্রাম', district: 'চট্টগ্রাম', postalCode: '4209' },
      drivingLicenseNumber: 'CL-CTG-2019-100014', drivingLicenseExpiryDate: new Date('2029-03-31'),
      emergencyContact: { name: 'হোসেন বিল্লাহ', phone: '01825-100014', relationship: 'বাবা' },
      status: 'active',
    },
  },
  {
    user: { name: 'সুমাইয়া আক্তার', email: 'customer15@gari-lagbe.com', phone: '01811-100015' },
    customer: {
      fullName: 'সুমাইয়া আক্তার', phone: '01811-100015', email: 'customer15@gari-lagbe.com',
      dateOfBirth: new Date('1999-12-05'),
      address: { street: '৪১ সুবহানঘাট', city: 'সিলেট', district: 'সিলেট', postalCode: '3100' },
      drivingLicenseNumber: null, drivingLicenseExpiryDate: null,
      emergencyContact: { name: 'লাইলা বেগম', phone: '01826-100015', relationship: 'বোন' },
      status: 'active',
    },
  },
  {
    user: { name: 'তানভীর আহমেদ', email: 'customer16@gari-lagbe.com', phone: '01811-100016' },
    customer: {
      fullName: 'তানভীর আহমেদ', phone: '01811-100016', email: 'customer16@gari-lagbe.com',
      dateOfBirth: new Date('1987-07-07'),
      address: { street: '১২ জিন্দাবাজার', city: 'সিলেট', district: 'সিলেট', postalCode: '3100' },
      drivingLicenseNumber: 'CL-SYL-2014-100016', drivingLicenseExpiryDate: new Date('2027-07-31'),
      emergencyContact: { name: 'শামিমা আহমেদ', phone: '01827-100016', relationship: 'স্ত্রী' },
      status: 'active',
    },
  },
  {
    user: { name: 'মনিরা খানম', email: 'customer17@gari-lagbe.com', phone: '01811-100017' },
    customer: {
      fullName: 'মনিরা খানম', phone: '01811-100017', email: 'customer17@gari-lagbe.com',
      dateOfBirth: new Date('1994-04-19'),
      address: { street: '৬৮ আম্বরখানা', city: 'সিলেট', district: 'সিলেট', postalCode: '3100' },
      drivingLicenseNumber: null, drivingLicenseExpiryDate: null,
      emergencyContact: { name: 'জাহানারা বেগম', phone: '01828-100017', relationship: 'মা' },
      status: 'active',
    },
  },
  {
    user: { name: 'মোঃ বেলাল হোসেন', email: 'customer18@gari-lagbe.com', phone: '01811-100018' },
    customer: {
      fullName: 'মোঃ বেলাল হোসেন', phone: '01811-100018', email: 'customer18@gari-lagbe.com',
      dateOfBirth: new Date('1990-01-28'),
      address: { street: '৩৮ বোয়ালিয়া', city: 'রাজশাহী', district: 'রাজশাহী', postalCode: '6000' },
      drivingLicenseNumber: 'CL-RAJ-2016-100018', drivingLicenseExpiryDate: new Date('2028-01-31'),
      emergencyContact: { name: 'বিলকিস বেগম', phone: '01829-100018', relationship: 'স্ত্রী' },
      status: 'active',
    },
  },
  {
    user: { name: 'নুসরাত জাহান', email: 'customer19@gari-lagbe.com', phone: '01811-100019' },
    customer: {
      fullName: 'নুসরাত জাহান', phone: '01811-100019', email: 'customer19@gari-lagbe.com',
      dateOfBirth: new Date('1997-09-03'),
      address: { street: '১৫ সাহেববাজার', city: 'রাজশাহী', district: 'রাজশাহী', postalCode: '6100' },
      drivingLicenseNumber: null, drivingLicenseExpiryDate: null,
      emergencyContact: { name: 'সাদিয়া ইসলাম', phone: '01831-100019', relationship: 'বোন' },
      status: 'active',
    },
  },
  {
    user: { name: 'মোহাম্মদ শামিম হোসেন', email: 'customer20@gari-lagbe.com', phone: '01811-100020' },
    customer: {
      fullName: 'মোহাম্মদ শামিম হোসেন', phone: '01811-100020', email: 'customer20@gari-lagbe.com',
      dateOfBirth: new Date('1983-05-14'),
      address: { street: '৭৭ উপশহর', city: 'রাজশাহী', district: 'রাজশাহী', postalCode: '6203' },
      drivingLicenseNumber: 'CL-RAJ-2010-100020', drivingLicenseExpiryDate: new Date('2026-05-31'),
      emergencyContact: { name: 'শামিমা হোসেন', phone: '01832-100020', relationship: 'স্ত্রী' },
      status: 'active',
    },
  },
  // Customers 21–30: Khulna, Barisal, Rangpur
  {
    user: { name: 'আয়েশা সিদ্দিকা', email: 'customer21@gari-lagbe.com', phone: '01811-100021' },
    customer: {
      fullName: 'আয়েশা সিদ্দিকা', phone: '01811-100021', email: 'customer21@gari-lagbe.com',
      dateOfBirth: new Date('1995-08-21'),
      address: { street: '২৩ সোনাডাঙ্গা', city: 'খুলনা', district: 'খুলনা', postalCode: '9100' },
      drivingLicenseNumber: null, drivingLicenseExpiryDate: null,
      emergencyContact: { name: 'সিদ্দিক হোসেন', phone: '01833-100021', relationship: 'বাবা' },
      status: 'active',
    },
  },
  {
    user: { name: 'মোঃ জিয়াউর রহমান', email: 'customer22@gari-lagbe.com', phone: '01811-100022' },
    customer: {
      fullName: 'মোঃ জিয়াউর রহমান', phone: '01811-100022', email: 'customer22@gari-lagbe.com',
      dateOfBirth: new Date('1988-11-16'),
      address: { street: '৫৫ খালিশপুর', city: 'খুলনা', district: 'খুলনা', postalCode: '9000' },
      drivingLicenseNumber: 'CL-KHU-2015-100022', drivingLicenseExpiryDate: new Date('2027-11-30'),
      emergencyContact: { name: 'রাহেলা বেগম', phone: '01834-100022', relationship: 'স্ত্রী' },
      status: 'active',
    },
  },
  {
    user: { name: 'পারভীন আক্তার', email: 'customer23@gari-lagbe.com', phone: '01811-100023' },
    customer: {
      fullName: 'পারভীন আক্তার', phone: '01811-100023', email: 'customer23@gari-lagbe.com',
      dateOfBirth: new Date('1993-02-03'),
      address: { street: '৮ রূপসা', city: 'খুলনা', district: 'খুলনা', postalCode: '9000' },
      drivingLicenseNumber: null, drivingLicenseExpiryDate: null,
      emergencyContact: { name: 'আক্তার হোসেন', phone: '01835-100023', relationship: 'স্বামী' },
      status: 'active',
    },
  },
  {
    user: { name: 'মোহাম্মদ নুরুজ্জামান', email: 'customer24@gari-lagbe.com', phone: '01811-100024' },
    customer: {
      fullName: 'মোহাম্মদ নুরুজ্জামান', phone: '01811-100024', email: 'customer24@gari-lagbe.com',
      dateOfBirth: new Date('1986-06-09'),
      address: { street: '৩১ বরিশাল সদর', city: 'বরিশাল', district: 'বরিশাল', postalCode: '8200' },
      drivingLicenseNumber: 'CL-BAR-2012-100024', drivingLicenseExpiryDate: new Date('2027-06-30'),
      emergencyContact: { name: 'জামিলা বেগম', phone: '01836-100024', relationship: 'স্ত্রী' },
      status: 'active',
    },
  },
  {
    user: { name: 'রিমা বেগম', email: 'customer25@gari-lagbe.com', phone: '01811-100025' },
    customer: {
      fullName: 'রিমা বেগম', phone: '01811-100025', email: 'customer25@gari-lagbe.com',
      dateOfBirth: new Date('1998-10-13'),
      address: { street: '৪৯ নথুল্লাবাদ', city: 'বরিশাল', district: 'বরিশাল', postalCode: '8200' },
      drivingLicenseNumber: null, drivingLicenseExpiryDate: null,
      emergencyContact: { name: 'মিলি বেগম', phone: '01837-100025', relationship: 'বোন' },
      status: 'active',
    },
  },
  {
    user: { name: 'আবুল বাশার', email: 'customer26@gari-lagbe.com', phone: '01811-100026' },
    customer: {
      fullName: 'আবুল বাশার', phone: '01811-100026', email: 'customer26@gari-lagbe.com',
      dateOfBirth: new Date('1984-03-25'),
      address: { street: '১৬ রংপুর সদর', city: 'রংপুর', district: 'রংপুর', postalCode: '5400' },
      drivingLicenseNumber: 'CL-RAN-2009-100026', drivingLicenseExpiryDate: new Date('2026-03-31'),
      emergencyContact: { name: 'হাসিনা বেগম', phone: '01838-100026', relationship: 'স্ত্রী' },
      status: 'active',
    },
  },
  {
    user: { name: 'মোসাম্মৎ লাইলী', email: 'customer27@gari-lagbe.com', phone: '01811-100027' },
    customer: {
      fullName: 'মোসাম্মৎ লাইলী', phone: '01811-100027', email: 'customer27@gari-lagbe.com',
      dateOfBirth: new Date('1996-07-17'),
      address: { street: '৬২ গণেশপুর', city: 'রংপুর', district: 'রংপুর', postalCode: '5400' },
      drivingLicenseNumber: null, drivingLicenseExpiryDate: null,
      emergencyContact: { name: 'কামরুল ইসলাম', phone: '01839-100027', relationship: 'স্বামী' },
      status: 'active',
    },
  },
  {
    user: { name: 'মোঃ আমিনুল হক', email: 'customer28@gari-lagbe.com', phone: '01811-100028' },
    customer: {
      fullName: 'মোঃ আমিনুল হক', phone: '01811-100028', email: 'customer28@gari-lagbe.com',
      dateOfBirth: new Date('1991-12-29'),
      address: { street: '২৮ দিনাজপুর সদর', city: 'দিনাজপুর', district: 'দিনাজপুর', postalCode: '5200' },
      drivingLicenseNumber: 'CL-DIN-2017-100028', drivingLicenseExpiryDate: new Date('2028-12-31'),
      emergencyContact: { name: 'হাফিজ উদ্দিন', phone: '01841-100028', relationship: 'বাবা' },
      status: 'active',
    },
  },
  {
    user: { name: 'শাহানা পারভীন', email: 'customer29@gari-lagbe.com', phone: '01811-100029' },
    customer: {
      fullName: 'শাহানা পারভীন', phone: '01811-100029', email: 'customer29@gari-lagbe.com',
      dateOfBirth: new Date('1994-05-08'),
      address: { street: '৯ ময়মনসিংহ সদর', city: 'ময়মনসিংহ', district: 'ময়মনসিংহ', postalCode: '2200' },
      drivingLicenseNumber: null, drivingLicenseExpiryDate: null,
      emergencyContact: { name: 'পারভেজ আলম', phone: '01842-100029', relationship: 'ভাই' },
      status: 'active',
    },
  },
  {
    user: { name: 'মোহাম্মদ মিজানুর রহমান', email: 'customer30@gari-lagbe.com', phone: '01811-100030' },
    customer: {
      fullName: 'মোহাম্মদ মিজানুর রহমান', phone: '01811-100030', email: 'customer30@gari-lagbe.com',
      dateOfBirth: new Date('1989-08-20'),
      address: { street: '৪৩ কুমিল্লা সদর', city: 'কুমিল্লা', district: 'কুমিল্লা', postalCode: '3500' },
      drivingLicenseNumber: 'CL-CUM-2015-100030', drivingLicenseExpiryDate: new Date('2027-08-31'),
      emergencyContact: { name: 'রহিমা বেগম', phone: '01843-100030', relationship: 'স্ত্রী' },
      status: 'active',
    },
  },
  // Customers 31–40: Various districts
  {
    user: { name: 'দিলরুবা আক্তার', email: 'customer31@gari-lagbe.com', phone: '01811-100031' },
    customer: {
      fullName: 'দিলরুবা আক্তার', phone: '01811-100031', email: 'customer31@gari-lagbe.com',
      dateOfBirth: new Date('1995-01-22'),
      address: { street: '১১ নোয়াখালী সদর', city: 'নোয়াখালী', district: 'নোয়াখালী', postalCode: '3800' },
      drivingLicenseNumber: null, drivingLicenseExpiryDate: null,
      emergencyContact: { name: 'দিলবার হোসেন', phone: '01844-100031', relationship: 'স্বামী' },
      status: 'active',
    },
  },
  {
    user: { name: 'মোঃ জাফর ইকবাল', email: 'customer32@gari-lagbe.com', phone: '01811-100032' },
    customer: {
      fullName: 'মোঃ জাফর ইকবাল', phone: '01811-100032', email: 'customer32@gari-lagbe.com',
      dateOfBirth: new Date('1987-04-16'),
      address: { street: '৫৬ ব্রাহ্মণবাড়িয়া সদর', city: 'ব্রাহ্মণবাড়িয়া', district: 'ব্রাহ্মণবাড়িয়া', postalCode: '3400' },
      drivingLicenseNumber: 'CL-BRH-2013-100032', drivingLicenseExpiryDate: new Date('2028-04-30'),
      emergencyContact: { name: 'ইকবাল হোসেন', phone: '01845-100032', relationship: 'বাবা' },
      status: 'active',
    },
  },
  {
    user: { name: 'রোকসানা বেগম', email: 'customer33@gari-lagbe.com', phone: '01811-100033' },
    customer: {
      fullName: 'রোকসানা বেগম', phone: '01811-100033', email: 'customer33@gari-lagbe.com',
      dateOfBirth: new Date('1992-10-07'),
      address: { street: '৩৭ ফেনী সদর', city: 'ফেনী', district: 'ফেনী', postalCode: '3900' },
      drivingLicenseNumber: null, drivingLicenseExpiryDate: null,
      emergencyContact: { name: 'রেজাউল করিম', phone: '01846-100033', relationship: 'স্বামী' },
      status: 'active',
    },
  },
  {
    user: { name: 'মোহাম্মদ কামাল হোসেন', email: 'customer34@gari-lagbe.com', phone: '01811-100034' },
    customer: {
      fullName: 'মোহাম্মদ কামাল হোসেন', phone: '01811-100034', email: 'customer34@gari-lagbe.com',
      dateOfBirth: new Date('1981-07-30'),
      address: { street: '২০ টাঙ্গাইল সদর', city: 'টাঙ্গাইল', district: 'টাঙ্গাইল', postalCode: '1900' },
      drivingLicenseNumber: 'CL-TAN-2007-100034', drivingLicenseExpiryDate: new Date('2026-07-31'),
      emergencyContact: { name: 'কামরুন্নাহার', phone: '01847-100034', relationship: 'স্ত্রী' },
      status: 'active',
    },
  },
  {
    user: { name: 'সানজিদা হোসেন', email: 'customer35@gari-lagbe.com', phone: '01811-100035' },
    customer: {
      fullName: 'সানজিদা হোসেন', phone: '01811-100035', email: 'customer35@gari-lagbe.com',
      dateOfBirth: new Date('1999-03-18'),
      address: { street: '৭৩ গাজীপুর সদর', city: 'গাজীপুর', district: 'গাজীপুর', postalCode: '1700' },
      drivingLicenseNumber: null, drivingLicenseExpiryDate: null,
      emergencyContact: { name: 'শাহানারা বেগম', phone: '01848-100035', relationship: 'মা' },
      status: 'active',
    },
  },
  {
    user: { name: 'মোঃ শহীদুল ইসলাম', email: 'customer36@gari-lagbe.com', phone: '01811-100036' },
    customer: {
      fullName: 'মোঃ শহীদুল ইসলাম', phone: '01811-100036', email: 'customer36@gari-lagbe.com',
      dateOfBirth: new Date('1985-11-11'),
      address: { street: '১৮ নরসিংদী সদর', city: 'নরসিংদী', district: 'নরসিংদী', postalCode: '1600' },
      drivingLicenseNumber: 'CL-NRS-2011-100036', drivingLicenseExpiryDate: new Date('2027-11-30'),
      emergencyContact: { name: 'শহিদা বেগম', phone: '01849-100036', relationship: 'স্ত্রী' },
      status: 'active',
    },
  },
  {
    user: { name: 'মাহফুজা খানম', email: 'customer37@gari-lagbe.com', phone: '01811-100037' },
    customer: {
      fullName: 'মাহফুজা খানম', phone: '01811-100037', email: 'customer37@gari-lagbe.com',
      dateOfBirth: new Date('1993-06-27'),
      address: { street: '৪৪ মানিকগঞ্জ সদর', city: 'মানিকগঞ্জ', district: 'মানিকগঞ্জ', postalCode: '1800' },
      drivingLicenseNumber: null, drivingLicenseExpiryDate: null,
      emergencyContact: { name: 'মাহবুব আলম', phone: '01851-100037', relationship: 'স্বামী' },
      status: 'active',
    },
  },
  {
    user: { name: 'মোহাম্মদ মাসুদ রানা', email: 'customer38@gari-lagbe.com', phone: '01811-100038' },
    customer: {
      fullName: 'মোহাম্মদ মাসুদ রানা', phone: '01811-100038', email: 'customer38@gari-lagbe.com',
      dateOfBirth: new Date('1990-02-14'),
      address: { street: '৬১ সাভার', city: 'ঢাকা', district: 'ঢাকা', postalCode: '1340' },
      drivingLicenseNumber: 'CL-DHK-2016-100038', drivingLicenseExpiryDate: new Date('2028-02-28'),
      emergencyContact: { name: 'সুমি আক্তার', phone: '01852-100038', relationship: 'স্ত্রী' },
      status: 'active',
    },
  },
  {
    user: { name: 'তানিয়া সুলতানা', email: 'customer39@gari-lagbe.com', phone: '01811-100039' },
    customer: {
      fullName: 'তানিয়া সুলতানা', phone: '01811-100039', email: 'customer39@gari-lagbe.com',
      dateOfBirth: new Date('1997-09-09'),
      address: { street: '৩ কেরানীগঞ্জ', city: 'ঢাকা', district: 'ঢাকা', postalCode: '1310' },
      drivingLicenseNumber: null, drivingLicenseExpiryDate: null,
      emergencyContact: { name: 'সুলতান আহমেদ', phone: '01853-100039', relationship: 'বাবা' },
      status: 'active',
    },
  },
  {
    user: { name: 'মোঃ রফিকুল আলম', email: 'customer40@gari-lagbe.com', phone: '01811-100040' },
    customer: {
      fullName: 'মোঃ রফিকুল আলম', phone: '01811-100040', email: 'customer40@gari-lagbe.com',
      dateOfBirth: new Date('1984-12-31'),
      address: { street: '৫০ মুন্সীগঞ্জ সদর', city: 'মুন্সীগঞ্জ', district: 'মুন্সীগঞ্জ', postalCode: '1500' },
      drivingLicenseNumber: 'CL-MUN-2010-100040', drivingLicenseExpiryDate: new Date('2026-12-31'),
      emergencyContact: { name: 'রাজিয়া সুলতানা', phone: '01854-100040', relationship: 'স্ত্রী' },
      status: 'active',
    },
  },
  // Customers 41–50: Mixed cities
  {
    user: { name: 'লামিয়া ইসলাম', email: 'customer41@gari-lagbe.com', phone: '01811-100041' },
    customer: {
      fullName: 'লামিয়া ইসলাম', phone: '01811-100041', email: 'customer41@gari-lagbe.com',
      dateOfBirth: new Date('2000-06-15'),
      address: { street: '১৯ যশোর সদর', city: 'যশোর', district: 'যশোর', postalCode: '7400' },
      drivingLicenseNumber: null, drivingLicenseExpiryDate: null,
      emergencyContact: { name: 'লুৎফর রহমান', phone: '01855-100041', relationship: 'বাবা' },
      status: 'active',
    },
  },
  {
    user: { name: 'মোঃ হাবিবুর রহমান', email: 'customer42@gari-lagbe.com', phone: '01811-100042' },
    customer: {
      fullName: 'মোঃ হাবিবুর রহমান', phone: '01811-100042', email: 'customer42@gari-lagbe.com',
      dateOfBirth: new Date('1988-03-02'),
      address: { street: '৬৬ ঝিনাইদহ সদর', city: 'ঝিনাইদহ', district: 'ঝিনাইদহ', postalCode: '7300' },
      drivingLicenseNumber: 'CL-JHE-2014-100042', drivingLicenseExpiryDate: new Date('2028-03-31'),
      emergencyContact: { name: 'হাবিবা বেগম', phone: '01856-100042', relationship: 'স্ত্রী' },
      status: 'active',
    },
  },
  {
    user: { name: 'ইসরাত জাহান', email: 'customer43@gari-lagbe.com', phone: '01811-100043' },
    customer: {
      fullName: 'ইসরাত জাহান', phone: '01811-100043', email: 'customer43@gari-lagbe.com',
      dateOfBirth: new Date('1996-10-24'),
      address: { street: '২৬ চাঁদপুর সদর', city: 'চাঁদপুর', district: 'চাঁদপুর', postalCode: '3600' },
      drivingLicenseNumber: null, drivingLicenseExpiryDate: null,
      emergencyContact: { name: 'ইসহাক মিয়া', phone: '01857-100043', relationship: 'বাবা' },
      status: 'active',
    },
  },
  {
    user: { name: 'মোহাম্মদ সালাহউদ্দিন', email: 'customer44@gari-lagbe.com', phone: '01811-100044' },
    customer: {
      fullName: 'মোহাম্মদ সালাহউদ্দিন', phone: '01811-100044', email: 'customer44@gari-lagbe.com',
      dateOfBirth: new Date('1982-08-05'),
      address: { street: '৩৯ লক্ষ্মীপুর সদর', city: 'লক্ষ্মীপুর', district: 'লক্ষ্মীপুর', postalCode: '3700' },
      drivingLicenseNumber: 'CL-LAK-2008-100044', drivingLicenseExpiryDate: new Date('2027-08-31'),
      emergencyContact: { name: 'সালেহা বেগম', phone: '01858-100044', relationship: 'স্ত্রী' },
      status: 'active',
    },
  },
  {
    user: { name: 'নাদিয়া আফরিন', email: 'customer45@gari-lagbe.com', phone: '01811-100045' },
    customer: {
      fullName: 'নাদিয়া আফরিন', phone: '01811-100045', email: 'customer45@gari-lagbe.com',
      dateOfBirth: new Date('1998-01-19'),
      address: { street: '৭ নেত্রকোনা সদর', city: 'নেত্রকোনা', district: 'নেত্রকোনা', postalCode: '2400' },
      drivingLicenseNumber: null, drivingLicenseExpiryDate: null,
      emergencyContact: { name: 'নাদিম হোসেন', phone: '01859-100045', relationship: 'ভাই' },
      status: 'active',
    },
  },
  {
    user: { name: 'মোঃ আলমগীর হোসেন', email: 'customer46@gari-lagbe.com', phone: '01811-100046' },
    customer: {
      fullName: 'মোঃ আলমগীর হোসেন', phone: '01811-100046', email: 'customer46@gari-lagbe.com',
      dateOfBirth: new Date('1986-05-11'),
      address: { street: '৫৮ কিশোরগঞ্জ সদর', city: 'কিশোরগঞ্জ', district: 'কিশোরগঞ্জ', postalCode: '2300' },
      drivingLicenseNumber: 'CL-KIS-2012-100046', drivingLicenseExpiryDate: new Date('2027-05-31'),
      emergencyContact: { name: 'আলমাস বেগম', phone: '01861-100046', relationship: 'স্ত্রী' },
      status: 'active',
    },
  },
  {
    user: { name: 'সেলিনা বেগম', email: 'customer47@gari-lagbe.com', phone: '01811-100047' },
    customer: {
      fullName: 'সেলিনা বেগম', phone: '01811-100047', email: 'customer47@gari-lagbe.com',
      dateOfBirth: new Date('1991-09-14'),
      address: { street: '৩৫ মৌলভীবাজার সদর', city: 'মৌলভীবাজার', district: 'মৌলভীবাজার', postalCode: '3200' },
      drivingLicenseNumber: null, drivingLicenseExpiryDate: null,
      emergencyContact: { name: 'সেলিম মিয়া', phone: '01862-100047', relationship: 'স্বামী' },
      status: 'active',
    },
  },
  {
    user: { name: 'মোহাম্মদ আশরাফুল হক', email: 'customer48@gari-lagbe.com', phone: '01811-100048' },
    customer: {
      fullName: 'মোহাম্মদ আশরাফুল হক', phone: '01811-100048', email: 'customer48@gari-lagbe.com',
      dateOfBirth: new Date('1983-02-28'),
      address: { street: '২৪ হবিগঞ্জ সদর', city: 'হবিগঞ্জ', district: 'হবিগঞ্জ', postalCode: '3300' },
      drivingLicenseNumber: 'CL-HAB-2009-100048', drivingLicenseExpiryDate: new Date('2026-02-28'),
      emergencyContact: { name: 'আশরাফুন্নেসা', phone: '01863-100048', relationship: 'স্ত্রী' },
      status: 'active',
    },
  },
  {
    user: { name: 'মুক্তা বেগম', email: 'customer49@gari-lagbe.com', phone: '01811-100049' },
    customer: {
      fullName: 'মুক্তা বেগম', phone: '01811-100049', email: 'customer49@gari-lagbe.com',
      dateOfBirth: new Date('2001-07-07'),
      address: { street: '১৩ পটুয়াখালী সদর', city: 'পটুয়াখালী', district: 'পটুয়াখালী', postalCode: '8600' },
      drivingLicenseNumber: null, drivingLicenseExpiryDate: null,
      emergencyContact: { name: 'মুকুল মিয়া', phone: '01864-100049', relationship: 'বাবা' },
      status: 'active',
    },
  },
  {
    user: { name: 'মোঃ রাশেদুল ইসলাম', email: 'customer50@gari-lagbe.com', phone: '01811-100050' },
    customer: {
      fullName: 'মোঃ রাশেদুল ইসলাম', phone: '01811-100050', email: 'customer50@gari-lagbe.com',
      dateOfBirth: new Date('1990-11-23'),
      address: { street: '৪৭ ভোলা সদর', city: 'ভোলা', district: 'ভোলা', postalCode: '8300' },
      drivingLicenseNumber: 'CL-BHO-2016-100050', drivingLicenseExpiryDate: new Date('2028-11-30'),
      emergencyContact: { name: 'রাশেদা বেগম', phone: '01865-100050', relationship: 'স্ত্রী' },
      status: 'active',
    },
  },
];

const PASSWORD = 'Customer@12345';

const seedCustomers = async () => {
  let created = 0;
  let skipped = 0;

  // Hash once and reuse for all customers
  const hashedPassword = await bcrypt.hash(PASSWORD, 12);

  for (const record of customerData) {
    // Duplicate prevention: check by unique email
    const existingUser = await User.findOne({ email: record.user.email });
    if (existingUser) {
      skipped++;
      continue;
    }

    // Create the User record
    const newUser = await User.create({
      name: record.user.name,
      email: record.user.email,
      phone: record.user.phone,
      password: hashedPassword,
      role: 'customer',
      isActive: true,
    });

    // Create the Customer record referencing the new User
    await Customer.create({
      user: newUser._id,
      fullName: record.customer.fullName,
      phone: record.customer.phone,
      email: record.customer.email,
      dateOfBirth: record.customer.dateOfBirth,
      address: record.customer.address,
      drivingLicenseNumber: record.customer.drivingLicenseNumber,
      drivingLicenseExpiryDate: record.customer.drivingLicenseExpiryDate,
      emergencyContact: record.customer.emergencyContact,
      status: record.customer.status,
    });

    created++;
  }

  console.log(`Customers seeded: ${created} created, ${skipped} skipped (already existed).`);
};

module.exports = seedCustomers;

