const JWT = require("jsonwebtoken");

//middleware
module.exports = async (req, res, next) => {
  try {
    //get the token(header of req)
    const token = req.headers["authorization"].split(" ")[1];

    //verify token with help of Secret key
    JWT.verify(token, process.env.JWT_SECRET, (err, decode) => {
      //if error in verification
      if (err) {
        return res.status(200).send({
          message: "Auth Failed",
          success: false,
        });
      } else {
        req.body.userId = decode.id;
        next();
      }
    });
  } catch (error) {
    console.log(error);
    res.status(401).send({
      message: "Auth Failed",
      success: false,
    });
  }
};
