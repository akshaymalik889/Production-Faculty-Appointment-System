const facultyModel = require("../models/facultyModel");
const userModel = require("../models/userModels");

const getAllUsersController = async (req, res) => {
  try {
    //get user
    const users = await userModel.find({});
    res.status(200).send({
      success: true,
      message: "Users Data List",
      data: users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error While Fethcing Users Data",
      error,
    });
  }
};

const getAllFacultyController = async (req, res) => {
  try {
    const faculty = await facultyModel.find({});
    res.status(200).send({
      success: true,
      message: "Faculty Data List",
      data: faculty,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error While Fetching Faculty Data",
      error,
    });
  }
};

//Faculty Account Status
const changeAccountStatusController = async (req, res) => {
  try {
    const { facultyId, status } = req.body;
    const faculty = await facultyModel.findByIdAndUpdate(facultyId, { status });
    const user = await userModel.findOne({ _id: faculty.userId });
    const notification = user.notification;
    notification.push({
      type: "faculty-account-request-updated",
      message: `Your Faculty Account Request Has ${status}`,
      onClickPath: "/notification",
    });

    //update user isFaculty status
    user.isFaculty = status === "approved" ? true : false;
    await user.save();
    res.status(201).send({
      success: true,
      message: "Account Status Updated",
      data: faculty,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Account Status",
      error,
    });
  }
};

module.exports = {
  getAllUsersController,
  getAllFacultyController,
  changeAccountStatusController,
};
