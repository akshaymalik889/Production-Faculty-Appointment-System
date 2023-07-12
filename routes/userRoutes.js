const express = require("express");
const {
  loginController,
  registerController,
  authController,
  applyAppointmentController,
  getAllNotificationController,
  deleteAllNotificationController,
  getAllFacultyController,
  bookappointmentController,
  bookingAvailabilityController,
  userAppointmentsController,
} = require("../controllers/userCtrl");
const authMiddleware = require("../middlewares/authMiddleware");

//router object
const router = express.Router();

//routes
//LOGIN  || POST
router.post("/login", loginController);

//REGISTER || POST
router.post("/register", registerController);

//AUTH || POST
router.post("/getUserData", authMiddleware, authController);

//Apply-Appointment || POST
router.post("/apply-appointment", authMiddleware, applyAppointmentController);

//Notification-Appointment || POST
router.post(
  "/get-all-notification",
  authMiddleware,
  getAllNotificationController
);

//Notification-Appointment || POST

router.post(
  "/delete-all-notification",
  authMiddleware,
  deleteAllNotificationController
);

//GET ALL FACULTY
router.get("/getAllFaculty", authMiddleware, getAllFacultyController);

//BOOK APPOINTMENT
router.post("/book-appointment", authMiddleware, bookappointmentController);

//BOOK AVAILABILITY
router.post(
  "/booking-availability",
  authMiddleware,
  bookingAvailabilityController
);

//Appointment List
router.get("/user-appointments", authMiddleware, userAppointmentsController);

module.exports = router;
