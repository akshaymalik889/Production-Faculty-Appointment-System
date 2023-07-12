const express = require("express");
const {
  getFacultyInfoController,
  updateProfileController,
  getFacultyByIdController,
  facultyAppointmentsController,
  updateStatusController,
} = require("../controllers/facultyCtrl");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

//POST ||  Single Faculty INFO
router.post("/getFacultyInfo", authMiddleware, getFacultyInfoController);

//POST || UPDATE PROFILE
router.post("/updateProfile", authMiddleware, updateProfileController);

//POST || get Single Faculty Info
router.post("/getFacultyById", authMiddleware, getFacultyByIdController);

//GET || Appointments
router.get(
  "/faculty-appointments",
  authMiddleware,
  facultyAppointmentsController
);

//POST || Update Status -> Approve -> User/Faculty Login ->Appointments
router.post("/update-status", authMiddleware, updateStatusController);

module.exports = router;
