const mongoose = require('mongoose');
const Maintenance = require('../models/Maintenance');
const Car = require('../models/Car');

/**
 * Helper to generate unique maintenance ID (e.g. MNT-2026-0051)
 */
const generateMaintenanceId = async () => {
  const year = new Date().getFullYear();
  const count = await Maintenance.countDocuments();
  const sequence = String(count + 1).padStart(4, '0');
  const candidateId = `MNT-${year}-${sequence}`;

  const exists = await Maintenance.findOne({ maintenanceId: candidateId });
  if (exists) {
    const timestamp = Date.now().toString().slice(-4);
    return `MNT-${year}-${timestamp}`;
  }
  return candidateId;
};

/**
 * @desc    Get all maintenance records (Admin only)
 * @route   GET /api/maintenance
 * @access  Private (Admin)
 */
const getAllMaintenance = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const { car, serviceType, status, search } = req.query;

    const query = {};

    if (car && mongoose.Types.ObjectId.isValid(car)) {
      query.car = car;
    }

    const validTypes = [
      'routine',
      'oil_change',
      'tire',
      'brake',
      'engine',
      'electrical',
      'bodywork',
      'other',
    ];
    if (serviceType && validTypes.includes(serviceType)) {
      query.serviceType = serviceType;
    }

    const validStatuses = ['scheduled', 'in_progress', 'completed', 'cancelled'];
    if (status && validStatuses.includes(status)) {
      query.status = status;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { maintenanceId: searchRegex },
        { serviceProvider: searchRegex },
        { description: searchRegex },
      ];
    }

    const total = await Maintenance.countDocuments(query);
    const totalPages = Math.ceil(total / limit) || 1;

    const records = await Maintenance.find(query)
      .populate('car')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'রক্ষণাবেক্ষণ রেকর্ডের তালিকা সফলভাবে পাওয়া গেছে।',
      data: {
        maintenance: records,
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
 * @desc    Get single maintenance record by ID (Admin only)
 * @route   GET /api/maintenance/:id
 * @access  Private (Admin)
 */
const getMaintenanceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'অবৈধ রক্ষণাবেক্ষণ আইডি প্রদান করা হয়েছে।',
      });
    }

    const record = await Maintenance.findById(id).populate('car');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'রক্ষণাবেক্ষণ রেকর্ড পাওয়া যায়নি।',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'রক্ষণাবেক্ষণ রেকর্ড বিবরণ সফলভাবে পাওয়া গেছে।',
      data: { maintenance: record },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new maintenance record (Admin only)
 * @route   POST /api/maintenance
 * @access  Private (Admin)
 */
const createMaintenance = async (req, res, next) => {
  try {
    const {
      carId,
      car: carParam,
      serviceType,
      description,
      serviceDate,
      completedDate,
      mileage,
      cost,
      serviceProvider,
      status,
      partsReplaced,
      notes,
      nextServiceDate,
    } = req.body;

    const targetCarId = carId || carParam;
    if (!targetCarId || !mongoose.Types.ObjectId.isValid(targetCarId)) {
      return res.status(400).json({
        success: false,
        message: 'সঠিক গাড়ি আইডি প্রদান করুন।',
      });
    }

    const car = await Car.findById(targetCarId);
    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'রক্ষণাবেক্ষণের জন্য নির্ধারিত গাড়িটি পাওয়া যায়নি।',
      });
    }

    const validTypes = [
      'routine',
      'oil_change',
      'tire',
      'brake',
      'engine',
      'electrical',
      'bodywork',
      'other',
    ];
    if (!serviceType || !validTypes.includes(serviceType)) {
      return res.status(400).json({
        success: false,
        message: 'অবৈধ সার্ভিস টাইপ প্রদান করা হয়েছে।',
      });
    }

    const validStatuses = ['scheduled', 'in_progress', 'completed', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'অবৈধ স্ট্যাটাস প্রদান করা হয়েছে।',
      });
    }

    if (!serviceDate) {
      return res.status(400).json({
        success: false,
        message: 'সার্ভিস এর তারিখ প্রদান করা আবশ্যক।',
      });
    }

    const sDate = new Date(serviceDate);
    const cDate = completedDate ? new Date(completedDate) : null;
    if (cDate && cDate < sDate) {
      return res.status(400).json({
        success: false,
        message: 'সম্পন্ন হওয়ার তারিখ সার্ভিস শুরুর তারিখের পূর্বে হতে পারবে না।',
      });
    }

    const parsedCost = cost !== undefined ? Number(cost) : 0;
    const parsedMileage = mileage !== undefined ? Number(mileage) : car.currentMileage || 0;
    if (isNaN(parsedCost) || parsedCost < 0 || isNaN(parsedMileage) || parsedMileage < 0) {
      return res.status(400).json({
        success: false,
        message: 'খরচ এবং মাইলেজ ঋণাত্মক হতে পারবে না।',
      });
    }

    const maintenanceId = await generateMaintenanceId();
    const maintenanceStatus = status || 'scheduled';

    const record = await Maintenance.create({
      maintenanceId,
      car: car._id,
      serviceType,
      description: description ? description.trim() : null,
      serviceDate: sDate,
      completedDate: cDate,
      mileage: parsedMileage,
      cost: parsedCost,
      serviceProvider: serviceProvider ? serviceProvider.trim() : null,
      status: maintenanceStatus,
      partsReplaced: Array.isArray(partsReplaced) ? partsReplaced : [],
      notes: notes ? notes.trim() : null,
      nextServiceDate: nextServiceDate ? new Date(nextServiceDate) : null,
    });

    // Update car status if in_progress and car is available
    if (maintenanceStatus === 'in_progress' && car.status === 'available') {
      await Car.updateOne({ _id: car._id }, { status: 'maintenance' });
    }

    const populatedRecord = await Maintenance.findById(record._id).populate('car');

    return res.status(201).json({
      success: true,
      message: 'রক্ষণাবেক্ষণ রেকর্ড সফলভাবে যুক্ত করা হয়েছে।',
      data: { maintenance: populatedRecord },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update maintenance record (Admin only)
 * @route   PUT /api/maintenance/:id
 * @access  Private (Admin)
 */
const updateMaintenance = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'অবৈধ রক্ষণাবেক্ষণ আইডি প্রদান করা হয়েছে।',
      });
    }

    const record = await Maintenance.findById(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'রক্ষণাবেক্ষণ রেকর্ড পাওয়া যায়নি।',
      });
    }

    if (req.body.serviceType) {
      const validTypes = [
        'routine',
        'oil_change',
        'tire',
        'brake',
        'engine',
        'electrical',
        'bodywork',
        'other',
      ];
      if (!validTypes.includes(req.body.serviceType)) {
        return res.status(400).json({
          success: false,
          message: 'অবৈধ সার্ভিস টাইপ প্রদান করা হয়েছে।',
        });
      }
    }

    if (req.body.status) {
      const validStatuses = ['scheduled', 'in_progress', 'completed', 'cancelled'];
      if (!validStatuses.includes(req.body.status)) {
        return res.status(400).json({
          success: false,
          message: 'অবৈধ স্ট্যাটাস প্রদান করা হয়েছে।',
        });
      }
    }

    const updatableFields = [
      'serviceType',
      'description',
      'serviceDate',
      'completedDate',
      'mileage',
      'cost',
      'serviceProvider',
      'status',
      'partsReplaced',
      'notes',
      'nextServiceDate',
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        record[field] = req.body[field];
      }
    });

    await record.save();

    // Car status sync
    if (record.status === 'completed') {
      const car = await Car.findById(record.car);
      if (car && car.status === 'maintenance') {
        await Car.updateOne({ _id: car._id }, { status: 'available' });
      }
    }

    const updatedRecord = await Maintenance.findById(record._id).populate('car');

    return res.status(200).json({
      success: true,
      message: 'রক্ষণাবেক্ষণ তথ্য সফলভাবে আপডেট করা হয়েছে।',
      data: { maintenance: updatedRecord },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update maintenance status (Admin only)
 * @route   PATCH /api/maintenance/:id/status
 * @access  Private (Admin)
 */
const updateMaintenanceStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'অবৈধ রক্ষণাবেক্ষণ আইডি প্রদান করা হয়েছে।',
      });
    }

    const validStatuses = ['scheduled', 'in_progress', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'অবৈধ স্ট্যাটাস প্রদান করা হয়েছে।',
      });
    }

    const record = await Maintenance.findById(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'রক্ষণাবেক্ষণ রেকর্ড পাওয়া যায়নি।',
      });
    }

    record.status = status;
    if (status === 'completed' && !record.completedDate) {
      record.completedDate = new Date();
    }

    await record.save();

    const car = await Car.findById(record.car);
    if (car) {
      if (status === 'in_progress' && car.status === 'available') {
        await Car.updateOne({ _id: car._id }, { status: 'maintenance' });
      } else if (status === 'completed' && car.status === 'maintenance') {
        await Car.updateOne({ _id: car._id }, { status: 'available' });
      }
    }

    const updatedRecord = await Maintenance.findById(record._id).populate('car');

    return res.status(200).json({
      success: true,
      message: 'রক্ষণাবেক্ষণ স্ট্যাটাস সফলভাবে পরিবর্তন করা হয়েছে।',
      data: { maintenance: updatedRecord },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a maintenance record (Admin only)
 * @route   DELETE /api/maintenance/:id
 * @access  Private (Admin)
 */
const deleteMaintenance = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'অবৈধ রক্ষণাবেক্ষণ আইডি প্রদান করা হয়েছে।',
      });
    }

    const record = await Maintenance.findById(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'রক্ষণাবেক্ষণ রেকর্ড পাওয়া যায়নি।',
      });
    }

    await Maintenance.deleteOne({ _id: id });

    return res.status(200).json({
      success: true,
      message: 'রক্ষণাবেক্ষণ রেকর্ড সফলভাবে মুছে ফেলা হয়েছে।',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllMaintenance,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  updateMaintenanceStatus,
  deleteMaintenance,
};
