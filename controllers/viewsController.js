const multer = require('multer');
const sharp = require('sharp');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
 
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  console.log(req.files);
  next();
});


exports.getOverview = catchAsync(async (req, res) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();

  // 2) Build template
  // 3) Render that template using tour data from 1)
  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) Get the data, for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }

  // 2) Build template
  // 3) Render template using data from 1)
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour
  });
});

exports.getSigIn = (req, res) => {
  res.status(200).render('signin', {
    title: 'Log into your account'
  });
};
// getSignup
exports.getSignup = (req, res) => {
  res.status(200).render('signup', {
    title: 'signup'
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account'
  });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });
  // console.log(bookings)
  // 2) Find tours with the returned IDs
  const tourIDs = bookings.map(el => el.tour.id);
  // console.log("touridssssssssssssss",tourIDs)
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('mytours', {
    title: 'My Tours',
    tours
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email
    },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser
  });
});

exports.stored = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).render('stored', {
    title: 'Stored Users',
    users
  });
});

// exports.storeTour = catchAsync(async (req, res, next) => {
//   const newTour = await new Tour(req.params.body);
//   await newTour.save();
//   res.status(200).redirect('/tour/stored');
// })

exports.storedTour = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();
  res.status(200).render('storedTour', {
    title: 'Stored Tour',
    tours
  });
});
// getTour
exports.getsTour = catchAsync(async (req, res, next) => {
  res.status(200).render('createtours');
});
//createtours
exports.creatTour = catchAsync(async (req, res, next) => {
  const newTour = await new Tour({
    name: req.body.name,
    price: req.body.price,
    description: req.body.description,
    duration: req.body.duration,
    maxGroupSize: req.body.maxGroupSize,
    imageCover: req.body.imageCover,
    images: req.body.images,
    difficulty: req.body.difficulty,
    summary: req.body.summary
  });
  await newTour.save();
  res.status(200).redirect('/tour/stored');
});

