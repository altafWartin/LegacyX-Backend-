const Joi = require("joi");
const mongodbIdPattern = /^[0-9a-fA-F]{24}$/;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,25}$/;
const hexCodePattern = /^#([0-9a-f]{6}|[0-9a-f]{3})$/;
class validationSchema {
  //image validation
  static viewAllEntity = Joi.object({
    // file: Yup.mixed().required("File is required"),
  });

  // //user registration schema
  //user registration schema
  static userRegisterSchema = Joi.object({
    username: Joi.string().min(5).max(30).required(),
    email: Joi.string().required(),
    promoCode: Joi.string().allow(null, ""),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string(),
    device_tokens: Joi.string(), // Updated to array of strings
  });

  //user login schema
  static userLoginSchema = Joi.object({
    email: Joi.string().required(),
    // password: Joi.string().pattern(passwordPattern),
    password: Joi.string().required(),
    device_tokens: Joi.string(), // Updated to array of strings

    
  });

  //user forget Password schema
  static userForgetPasswordSchema = Joi.object({
    email: Joi.string().required(),
  });

  //user OPT vefiry schema
  static userOTPSchema = Joi.object({
    otp: Joi.number().integer().min(100000).max(999999).required(),
  });

  //user confirm password schema
  static userConfirmPasswordSchema = Joi.object({
    // password: Joi.string().pattern(passwordPattern).required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string(),
  });

  //id schema
  static getByIdSchema = Joi.object({
    id: Joi.string().regex(mongodbIdPattern).required(),
  });

  //user registration schema
  static uploadEntity = Joi.object({
    visibility: Joi.boolean().required(),
    tags: Joi.string(),
    caption: Joi.string(),
  });

  //user registration schema
  static createCollection = Joi.object({
    name: Joi.string().max(100).required(),
  });

  //user registration schema
  static editMediaSchema = Joi.object({
    id: Joi.string().regex(mongodbIdPattern).required(),
    visibility: Joi.boolean(),
    collectionId: Joi.string().regex(mongodbIdPattern),
  });

  //user registration schema
  static editGifSchema = Joi.object({
    id: Joi.string().regex(mongodbIdPattern).required(),
    text: Joi.string().min(5).max(100).required(),
    color: Joi.string().regex(hexCodePattern),
    fontSize: Joi.number().integer().min(10).max(100),
  });
}

module.exports = validationSchema;
