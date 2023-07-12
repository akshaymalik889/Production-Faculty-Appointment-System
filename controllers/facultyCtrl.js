const appointmentModel = require("../models/appointmentModel");
const facultyModel = require("../models/facultyModel");
const userModel = require("../models/userModels");

const getFacultyInfoController = async (req, res) => {
  try {
    const faculty = await facultyModel.findOne({ userId: req.body.userId });
    res.status(200).send({
      success: true,
      message: "Faculty Data Fetch Successfully",
      data: faculty,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in Fetching Faculty Details",
    });
  }
};

//update Faculty Profile
const updateProfileController = async (req, res) => {
  try {
    const faculty = await facultyModel.findOneAndUpdate(
      { userId: req.body.userId },
      req.body
    );
    res.status(201).send({
      success: true,
      message: "Faculty Profile Updated",
      data: faculty,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Faculty Profile Update Issue",
      error,
    });
  }
};

//get single faculty
const getFacultyByIdController = async (req, res) => {
  try {
    const faculty = await facultyModel.findOne({ _id: req.body.facultyId });
    res.status(200).send({
      success: true,
      message: "Single Faculty Info",
      data: faculty,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in Fetching Single Faculty Info ",
    });
  }
};

//Faculty -> Appointment List
const facultyAppointmentsController = async (req, res) => {
  try {
    const faculty = await facultyModel.findOne({ userId: req.body.userId });
    const appointments = await appointmentModel.find({
      facultyId: faculty._id,
    });
    res.status(200).send({
      success: true,
      message: "Faculty Appointments Fetch Successfully",
      data: appointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in Faculty Appointments",
    });
  }
};

const updateStatusController = async (req, res) => {
  try {
    const { appointmentsId, status } = req.body;
    const appointments = await appointmentModel.findByIdAndUpdate(
      appointmentsId,
      { status }
    );
    const user = await userModel.findOne({ _id: appointments.userId });
    const notification = user.notification;
    notification.push({
      type: "status-updated ",
      message: `Your Appointment Has Been Updated ${status}`,
      onClickPath: "/faculty-appointments",
    });
    await user.save();
    res.status(200).send({
      success: true,
      message: "Appointment Status Updated",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in Update Status",
    });
  }
};

module.exports = {
  getFacultyInfoController,
  updateProfileController,
  getFacultyByIdController,
  facultyAppointmentsController,
  updateStatusController,
};
