const userModel = require("../models/userModels");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken"); //generate Token
const facultyModel = require("../models/facultyModel");
const appointmentModel = require("../models/appointmentModel");
const moment = require("moment");

//register callback
const registerController = async (req, res) => {
  try {
    //if already user email registered
    const existingUser = await userModel.findOne({ email: req.body.email });

    if (existingUser) {
      return res
        .status(200)
        .send({ message: "User Already Exists", success: false });
    }

    //else new register so we have to register

    //getting password
    const password = req.body.password;

    //creating salt (bcrypt module part)
    const salt = await bcrypt.genSalt(10); //hash password 10 times/rounds
    const hashedPassword = await bcrypt.hash(password, salt); //encryptred password
    req.body.password = hashedPassword; //repalace encrypt password with user password

    //create new user Using user Model
    const newUser = new userModel(req.body);
    await newUser.save(); //save new user
    res.status(201).send({ message: "Register Successfully", success: true });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: `Register Controller ${error.message}`,
    });
  }
};

//Login callback
const loginController = async (req, res) => {
  try {
    //get user email to check register user or not
    const user = await userModel.findOne({ email: req.body.email });

    //if not register user
    if (!user) {
      return res
        .status(200)
        .send({ message: "User Not Found", success: false });
    }

    //register user

    //get password to decrypt
    const isMatch = await bcrypt.compare(req.body.password, user.password);

    //if password not match
    if (!isMatch) {
      return res
        .status(200)
        .send({ message: "Invalid Email or Password", success: false });
    }

    //if email and password both correct/matched

    //we add token to make more secure
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.status(200).send({ message: "Login Success", success: true, token });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: `Error in Login CTRL ${error.message}` });
  }
};

//controller for AUTH || POST
const authController = async (req, res) => {
  try {
    const user = await userModel.findById({ _id: req.body.userId });
    user.password = undefined;
    if (!user) {
      return res.status(200).send({
        message: "User Not Found",
        success: false,
      });
    } else {
      res.status(200).send({
        success: true,
        data: user,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Auth Error",
      success: false,
      error,
    });
  }
};

//Apply-Appointment Controller
const applyAppointmentController = async (req, res) => {
  try {
    const newAppointment = await facultyModel({
      ...req.body,
      status: "pending",
    });
    await newAppointment.save();

    //for notification
    const adminUser = await userModel.findOne({ isAdmin: true });
    const notification = adminUser.notification;
    notification.push({
      type: "apply-appointment-request",
      message: `${newAppointment.firstName} ${newAppointment.lastName} Has Applied for Appointment`,
      data: {
        facultyId: newAppointment._id,
        name: newAppointment.firstName + " " + newAppointment.lastName,
        onClickPath: "/admin/faculty",
      },
    });
    await userModel.findByIdAndUpdate(adminUser._id, { notification });
    res.status(201).send({
      success: true,
      message: "Appointment Applied Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error while Applying for Appointment",
    });
  }
};

//Notification Controller
const getAllNotificationController = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId });
    const seennotification = user.seennotification;
    const notification = user.notification;
    seennotification.push(...notification);
    user.notification = [];
    user.seennotification = notification;
    const updatedUser = await user.save();
    res.status(200).send({
      success: true,
      message: "All Notification Marked as Read",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error in Notification",
      success: false,
      error,
    });
  }
};

//Delete Notification
const deleteAllNotificationController = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId });
    user.notification = [];
    user.seennotification = [];
    const updatedUser = await user.save();
    updatedUser.password = undefined;
    res.status(200).send({
      success: true,
      message: "Notifications Deleted Successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Unable to Delete All Notifications",
      error,
    });
  }
};

//GET ALL FACULTY
const getAllFacultyController = async (req, res) => {
  try {
    const faculty = await facultyModel.find({ status: "approved" });
    res.status(200).send({
      success: true,
      message: "Faculty List Fetch Successfully",
      data: faculty,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error While Fetching Faculty",
    });
  }
};

//BOOK APPOINTMENT
const bookappointmentController = async (req, res) => {
  try {
    req.body.date = moment(req.body.date, "DD-MM-YYYY").toISOString();
    req.body.time = moment(req.body.time, "HH:mm").toISOString();
    req.body.status = "pending";
    const newAppointment = new appointmentModel(req.body);
    await newAppointment.save();
    const user = await userModel.findOne({ _id: req.body.facultyInfo.userId });
    user.notification.push({
      type: "New-appointment-request",
      message: `A New Appointment Request From ${req.body.userInfo.name}`,
      onClickPath: "/user/appointments",
    });
    await user.save();
    res.status(200).send({
      success: true,
      message: "Appointment Booked Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error While Booking Apointment",
    });
  }
};

//Book Availability
const bookingAvailabilityController = async (req, res) => {
  try {
    const date = moment(req.body.date, "DD-MM-YYYY").toISOString();
    const fromTime = moment(req.body.time, "HH:mm")
      .subtract(1, "hours")
      .toISOString();
    const toTime = moment(req.body.time, "HH:mm").add(1, "hours").toISOString();
    const facultyId = req.body.facultyId;
    const appointments = await appointmentModel.find({
      facultyId,
      date,
      time: {
        $gte: fromTime,
        $lte: toTime,
      },
    });
    if (appointments.length > 0) {
      return res.status(200).send({
        message: "Appointments Not Available At This Time",
        success: true,
      });
    } else {
      return res.status(200).send({
        success: true,
        message: "Appointment Available",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in Booking Availability",
    });
  }
};

//Appointment List
const userAppointmentsController = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({
      userId: req.body.userId,
    });
    res.status(200).send({
      success: true,
      message: "User Appointments Fetch Successfully",
      data: appointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in User Appointment List",
    });
  }
};

module.exports = {
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
};
