const UserDTO = require("../dto/user");
const User = require("../models/user");
const JWTService = require("../services/JWTService");

const user = async (req, res, next) => {
  try {
    const accessToken = req.headers.access_token;
    // 1.Validating
    if (!accessToken) {
      const error = {
        status: 401,
        message: "Unauthorized",
      };
      return next(error);
    }

    //2. Verifying AccessToken
    let data;
    try {
      data = await JWTService.verifyAccessToken(accessToken);
    } catch (error) {
      return next(error);
    }
    //3. Getting User data for demo purpose
    let user;
    try {
      if (data?.email) {
        user = await User.findOne({ email: data.email });
      } else {
        const error = {
          status: 401,
          message: "Unauthorized",
        };
        return next(error);
      }
    } catch (error) {
      return next(error);
    }
    //Sending user data in req as middleWare will work in between
    //req and response
    const userDto = new UserDTO(user);
    req.user = userDto;

    //calling next middleware
    next();
  } catch (error) {
    return next(error);
  }
};

module.exports = user;
