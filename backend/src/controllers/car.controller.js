const mongoose = require('mongoose');
const Car = require('../models/Car');
const Booking = require('../models/Booking');
const Rental = require('../models/Rental');

/**
 * @desc    Get all cars (Public, with filters & pagination)
 * @route   GET /api/cars
 * @access  Public
 */
const getAllCars = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const { search, brand, model, type, carType, status, minPrice, maxPrice } = req.query;

    const query = {};

    const targetType = type || carType;
    if (targetType && ['sedan', 'suv', 'hatchback', 'microbus', 'pickup'].includes(targetType)) {
      query.carType = targetType;
    }

    if (status && ['available', 'rented', 'reserved', 'maintenance', 'inactive'].includes(status)) {
      query.status = status;
    }

    if (brand && brand.trim()) {
      query.brand = new RegExp(brand.trim(), 'i');
    }

    if (model && model.trim()) {
      query.model = new RegExp(model.trim(), 'i');
    }

    if (minPrice || maxPrice) {
      query.dailyRentalPrice = {};
      if (minPrice) query.dailyRentalPrice.$gte = Number(minPrice);
      if (maxPrice) query.dailyRentalPrice.$lte = Number(maxPrice);
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { brand: searchRegex },
        { model: searchRegex },
        { registrationNumber: searchRegex },
      ];
    }

    const total = await Car.countDocuments(query);
    const totalPages = Math.ceil(total / limit) || 1;

    const cars = await Car.find(query)
      .populate('assignedDriver')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'গাড়ির তালিকা সফলভাবে পাওয়া গেছে।',
      data: {
        cars,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single car details by ID
 * @route   GET /api/cars/:id
 * @access  Public
 */
const getCarById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'অবৈধ গাড়ি আইডি প্রদান করা হয়েছে।',
      });
    }

    const car = await Car.findById(id).populate('assignedDriver');

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'গাড়ি পাওয়া যায়নি।',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'গাড়ির বিবরণ সফলভাবে পাওয়া গেছে।',
      data: { car },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new car (Admin only)
 * @route   POST /api/cars
 * @access  Private (Admin)
 */
const createCar = async (req, res, next) => {
  try {
    const {
      name,
      brand,
      model,
      registrationNumber,
      carType,
      year,
      seatingCapacity,
      fuelType,
      transmission,
      dailyRentalPrice,
      images,
      description,
      status,
      assignedDriver,
      currentMileage,
    } = req.body;

    if (
      !name ||
      !brand ||
      !model ||
      !registrationNumber ||
      !carType ||
      !year ||
      !seatingCapacity ||
      !fuelType ||
      !transmission ||
      !dailyRentalPrice
    ) {
      return res.status(400).json({
        success: false,
        message: 'গাড়ির সমস্ত প্রয়োজনীয় তথ্য প্রদান করা আবশ্যক।',
      });
    }

    // Check duplicate registration number
    const regUpper = registrationNumber.toUpperCase().trim();
    const existingReg = await Car.findOne({ registrationNumber: regUpper });
    if (existingReg) {
      return res.status(400).json({
        success: false,
        message: 'এই রেজিস্ট্রেশন নম্বরের গাড়ি ইতিপূর্বে যুক্ত করা হয়েছে।',
      });
    }

    const car = await Car.create({
      name: name.trim(),
      brand: brand.trim(),
      model: model.trim(),
      registrationNumber: regUpper,
      carType,
      year: Number(year),
      seatingCapacity: Number(seatingCapacity),
      fuelType,
      transmission,
      dailyRentalPrice: Number(dailyRentalPrice),
      images: images || [],
      description: description ? description.trim() : null,
      status: status || 'available',
      assignedDriver: assignedDriver || null,
      currentMileage: currentMileage ? Number(currentMileage) : 0,
    });

    return res.status(201).json({
      success: true,
      message: 'নতুন গাড়ি সফলভাবে যুক্ত করা হয়েছে।',
      data: { car },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update car details (Admin only)
 * @route   PUT /api/cars/:id
 * @access  Private (Admin)
 */
const updateCar = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'অবৈধ গাড়ি আইডি প্রদান করা হয়েছে।',
      });
    }

    const car = await Car.findById(id);
    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'গাড়ি পাওয়া যায়নি।',
      });
    }

    if (req.body.registrationNumber) {
      const regUpper = req.body.registrationNumber.toUpperCase().trim();
      if (regUpper !== car.registrationNumber) {
        const existingReg = await Car.findOne({ registrationNumber: regUpper });
        if (existingReg) {
          return res.status(400).json({
            success: false,
            message: 'এই রেজিস্ট্রেশন নম্বরটি অন্য একটি গাড়িতে ব্যবহৃত হচ্ছে।',
          });
        }
        car.registrationNumber = regUpper;
      }
    }

    const updatableFields = [
      'name',
      'brand',
      'model',
      'carType',
      'year',
      'seatingCapacity',
      'fuelType',
      'transmission',
      'dailyRentalPrice',
      'images',
      'description',
      'status',
      'assignedDriver',
      'currentMileage',
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        car[field] = req.body[field];
      }
    });

    await car.save();

    const updatedCar = await Car.findById(car._id).populate('assignedDriver');

    return res.status(200).json({
      success: true,
      message: 'গাড়ির তথ্য সফলভাবে আপডেট করা হয়েছে।',
      data: { car: updatedCar },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a car (Admin only, with reference safety check)
 * @route   DELETE /api/cars/:id
 * @access  Private (Admin)
 */
const deleteCar = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'অবৈধ গাড়ি আইডি প্রদান করা হয়েছে।',
      });
    }

    const car = await Car.findById(id);
    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'গাড়ি পাওয়া যায়নি।',
      });
    }

    // Check if car has active/running bookings or rentals
    const activeBooking = await Booking.findOne({
      car: id,
      status: { $in: ['pending', 'confirmed'] },
    });

    const activeRental = await Rental.findOne({
      car: id,
      status: { $in: ['scheduled', 'active', 'overdue'] },
    });

    if (activeBooking || activeRental) {
      return res.status(400).json({
        success: false,
        message: 'গাড়িটি সক্রিয় বা অপেক্ষমাণ বুকিং/রেন্টালে যুক্ত থাকায় মুছে ফেলা সম্ভব নয়।',
      });
    }

    await Car.deleteOne({ _id: id });

    return res.status(200).json({
      success: true,
      message: 'গাড়ি সফলভাবে মুছে ফেলা হয়েছে।',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update car status (Admin only)
 * @route   PATCH /api/cars/:id/status
 * @access  Private (Admin)
 */
const updateCarStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'অবৈধ গাড়ি আইডি প্রদান করা হয়েছে।',
      });
    }

    const validStatuses = ['available', 'rented', 'reserved', 'maintenance', 'inactive'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'অবৈধ স্ট্যাটাস প্রদান করা হয়েছে। স্ট্যাটাস অবশ্যই available, rented, reserved, maintenance, অথবা inactive হতে হবে।',
      });
    }

    const car = await Car.findById(id);
    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'গাড়ি পাওয়া যায়নি।',
      });
    }

    car.status = status;
    await car.save();

    const updatedCar = await Car.findById(car._id).populate('assignedDriver');

    return res.status(200).json({
      success: true,
      message: 'গাড়ির স্ট্যাটাস সফলভাবে পরিবর্তন করা হয়েছে।',
      data: { car: updatedCar },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
  updateCarStatus,
};
