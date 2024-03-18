const User = require("../models/user");
const Media = require("../models/media");
const bcrypt = require("bcryptjs");
const UserDTO = require("../dto/user");
const JWTService = require("../services/JWTService");
const validationSchema = require("../validation/validationSchema");
const { sendMail } = require("../util/email");
const stripe = require("../config/stripe");

const authController = {
  async register(req, res, next) {
    // 1.Validate user input

    const { error } = validationSchema.userRegisterSchema.validate(req.body);
    // 2.If error in validation__ return error via middleware
    if (error) {
      return next(error);
    }

    // 3.If username or email already exist__ return error
    const { username, email, password, promoCode, device_tokens } = req.body;
    console.log(username, email, password, promoCode, device_tokens);
    let accessToken;
    try {
      const numberInUse = await User.exists({ email });
      console.log(numberInUse);
      if (numberInUse) {
        const user = await User.findOne({ _id: numberInUse._id });
        console.log(user);
        if (user.verified) {
          const error = {
            status: 409,
            message: "Email already registered, choose another email!",
          };
          return next(error);
        } else {
          accessToken = JWTService.signAccessToken({
            _id: user._id,
          });
          return res.status(201).json({
            message: `An OTP has been sent to this ${email}, please verify`,
            token: accessToken,
          });
        }
      }
    } catch (error) {
      return next(error);
    }
    // 4.Password Hashed
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000);
    let user;
    try {
      // 5.Store User data in db
      const userToRegister = new User({
        username,
        password: hashedPassword,
        otp,
        email,
        device_tokens,
        promoCode,
        verified: false,
      });

      user = await userToRegister.save();

      //generate token
      accessToken = JWTService.signAccessToken({
        _id: user._id,
      });
    } catch (error) {
      return next(error);
    }

    return res.status(201).json({
      message: `An OTP has been sent to this ${email}, please verify`,
      token: accessToken,
    });
  },

  async login(req, res, next) {
    // 1. Validate user Input
    const { error } = validationSchema.userLoginSchema.validate(req.body);

    // 2. If validation error, return error
    if (error) {
      return next(error);
    }

    // 3. Match password and username
    const { email, password, device_tokens } = req.body;
    let user;

    try {
      user = await User.findOne({ email });

      if (!user) {
        const error = {
          status: 401,
          message: "Invalid Email",
        };
        return next(error);
      }

      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        const error = {
          status: 401,
          message: "Invalid Password",
        };
        return next(error);
      }
    } catch (error) {
      return next(error);
    }

    // Update device token if provided
    if (device_tokens) {
      try {
        user.device_tokens = device_tokens;
        await user.save();
      } catch (error) {
        return next(error);
      }
    }

    const accessToken = JWTService.signAccessToken({
      _id: user._id,
      email,
    });

    // 4. Send response
    const userDto = new UserDTO(user);

    let subscribedProducts = await getDetailsByCusId(user?.stripe_customer_id);

    return res.status(200).json({
      user: { ...userDto, subscribed: subscribedProducts },
      token: accessToken,
    });
  },

  async loginAdmin(req, res, next) {
    // Hardcoded admin credentials
    const adminCredentials = {
      email: "admin@example.com",
      password: "admin123",
    };
    const { email, password } = req.body;
    console.log(email, password);

    // Check if provided credentials match the admin credentials
    if (
      email === adminCredentials.email &&
      password === adminCredentials.password
    ) {
      // Generate JWT access token
      const accessToken = JWTService.signAccessToken({ email });
      // You can fetch user details from the database if needed, or create a user object
      const user = { email: adminCredentials.email }; // Here, I'm just creating a dummy user object

      res
        .status(200)
        .json({ message: "Admin login successful", user, accessToken });
    } else {
      res.status(401).json({ error: "Invalid email or password" });
    }
  },

  // async login(req, res, next) {
  //   // 1.Validate user Input
  //   const { error } = validationSchema.userLoginSchema.validate(req.body);

  //   // 2.If validation error, return error
  //   if (error) {
  //     return next(error);
  //   }
  //   // 3.Match password and username
  //   const { email, password, device_tokens } = req.body;
  //   let user;

  //   try {
  //     user = await User.findOne({ email });

  //     if (!user) {
  //       const error = {
  //         status: 401,
  //         message: "Invalid Email",
  //       };
  //       return next(error);
  //     }

  //     const match = await bcrypt.compare(password, user.password);

  //     if (!match) {
  //       const error = {
  //         status: 401,
  //         message: "Invalid Password",
  //       };
  //       return next(error);
  //     }
  //   } catch (error) {
  //     return next(error);
  //   }

  //   const accessToken = JWTService.signAccessToken({
  //     _id: user._id,
  //     email,
  //   });

  //   // 4.Send response
  //   const userDto = new UserDTO(user);

  //   let subscribedProducts = await getDetailsByCusId(user?.stripe_customer_id);

  //   return res.status(200).json({
  //     user: { ...userDto, subscribed: subscribedProducts },
  //     token: accessToken,
  //   });
  // },

  async forgetPassword(req, res, next) {
    console.log(req);
    // 1.Validate user Input
    const { error } = validationSchema.userForgetPasswordSchema.validate(
      req.body
    );

    // 2.If validation error, return error
    if (error) {
      return next(error);
    }
    // 3.Match password and username
    const { email } = req.body;
    let user;

    try {
      const otp = Math.floor(100000 + Math.random() * 900000);

      user = await User.findOneAndUpdate(
        { email },
        { $set: { otp } },
        { new: true }
      );

      if (!user) {
        const error = {
          status: 401,
          message: "Invalid Email",
        };
        return next(error);
      }
      sendMail(user?.email, "Password Reset Code", `Your OTP is : ${otp}`);
    } catch (error) {
      return next(error);
    }

    const accessToken = JWTService.signAccessToken({ _id: user._id });

    return res.status(200).json({
      message: `An OTP has been sent to this ${email}, please verify`,
      token: accessToken,
    });
  },

  async verifyOTP(req, res, next) {
    // 1.Validate user Input
    const { error } = validationSchema.userOTPSchema.validate(req.body);

    // 2.If validation error, return error
    if (error) {
      return next(error);
    }
    // 3.Match password and username
    const { otp } = req.body;
    let user = req.user;

    try {
      user = await User.findOne({ _id: user._id });

      if (!user) {
        const error = {
          status: 401,
          message: "Invalid User",
        };
        return next(error);
      }

      const match = otp == user.otp;

      if (!match) {
        const error = {
          status: 401,
          message: "Invalid OTP",
        };
        return next(error);
      } else {
        user = await User.findOneAndUpdate(
          { _id: user._id },
          { $set: { otp: "", verified: true } },
          { new: true }
        );
      }
    } catch (error) {
      return next(error);
    }

    const accessToken = JWTService.signAccessToken({ _id: user._id });

    return res.status(200).json({
      message: "OTP has been verified successfully.!",
      token: accessToken,
    });
  },

  async regenerateOtp(req, res, next) {
    let user = req.user;

    try {
      const otp = "666555";

      user = await User.findOneAndUpdate(
        { _id: user._id },
        { $set: { otp } },
        { new: true }
      );

      if (!user) {
        const error = {
          status: 401,
          message: "Invalid User",
        };
        return next(error);
      }
    } catch (error) {
      return next(error);
    }

    const accessToken = JWTService.signAccessToken({ _id: user._id });

    return res.status(200).json({ token: accessToken });
  },

  async changePassword(req, res, next) {
    // 1.Validate user Input
    const { error } = validationSchema.userConfirmPasswordSchema.validate(
      req.body
    );

    // 2.If validation error, return error
    if (error) {
      return next(error);
    }
    // 3.Match password and username
    const { password } = req.body;
    //getting user from request (auth middleware)
    let user = req.user;
    if (!user.verified) {
      const error = {
        status: 401,
        message: "Unauthorized",
      };
      return next(error);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      user = await User.findOneAndUpdate(
        { _id: user._id },
        { $set: { password: hashedPassword, otp: "" } },
        { new: true }
      );

      if (!user) {
        const error = {
          status: 401,
          message: "Invalid User",
        };
        return next(error);
      }
    } catch (error) {
      return next(error);
    }

    // 4.Send response
    const userDto = new UserDTO(user);

    return res.status(200).json({ user: userDto });
  },
  async updateProfile(req, res) {
    try {
      let { user, body } = req;
      user = await User.findById(user._id);
      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            username: body?.username ? body?.username : user?.username,
            profileImage: body?.profileImage
              ? body?.profileImage
              : user?.profileImage,
            coverImage: body?.coverImage ? body?.coverImage : user?.coverImage,
            facebook: body?.facebook ? body?.facebook : user?.facebook,
            instagram: body?.instagram ? body?.instagram : user?.instagram,
            twitter: body?.twitter ? body?.twitter : user?.twitter,
          },
        }
      );
      const _user = await User.findById(user?._id);
      return res
        .status(200)
        .send({ message: "Profile Updated Successfully", user: _user });
    } catch (e) {
      return res.status(500).send({ message: e?.message });
    }
  },
  async getPorfile(req, res, next) {
    //getting user from request (auth middleware)
    let user = req.user;

    try {
      user = await User.findById(user._id).lean();

      if (!user) {
        const error = {
          status: 401,
          message: "Invalid User",
        };
        return next(error);
      }
    } catch (error) {
      return next(error);
    }

    // 4.Send response
    const userDto = new UserDTO(user);

    let subscribedProducts = await getDetailsByCusId(user?.stripe_customer_id);

    return res
      .status(200)
      .json({ user: { ...userDto, subscribed: subscribedProducts } });
  },

  async getallPorfile(req, res, next) {
    console.log("getall");
    try {
      const users = await User.find();
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  uploadImage(req, res) {
    console.log(req?.file, req.body.entityType);
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const protocol = req.protocol;
    const host = req.headers.host;
    const baseUrl = `${protocol}://${host}`;
    const fileUrl = `${baseUrl}/${req.body.entityType}/${req.file.filename}`;
    return res
      .status(200)
      .json({ message: "File uploaded successfully", imageUrl: fileUrl });
  },

  async updatePassword(req, res) {
    try {
      let { user, body } = req;
      user = await User.findById(user._id);

      if (!body?.password) {
        return res.status(400).send({ message: "Password is required" });
      }
      if (!body?.newPassword) {
        return res.status(400).send({ message: "Password is required" });
      }
      const valid = await bcrypt.compare(body.password, user?.password);
      if (valid) {
        let newPassword = await bcrypt.hash(body.newPassword, 10);
        await User.updateOne(
          { _id: user._id },
          {
            $set: {
              password: newPassword,
            },
          }
        );
        return res
          .status(200)
          .send({ message: "Password Updated Successfully" });
      }
      return res.status(400).send({ message: "Current Password is invalid" });
    } catch (e) {
      return res.status(500).send({ message: e?.message });
    }
  },

  async deleteAccount(req, res) {
    try {
      let { user, body } = req;

      await Media.deleteOne({ author: user?._id });
      await User.deleteOne({ _id: user?._id });
      return res.status(200).send({ message: "Account Deleted Successful" });
    } catch (e) {
      return res.status(500).send({ message: e?.message });
    }
  },

  async logout(req, res, next) {
    //3. Response
    res.status(200).json({ user: null, auth: false });
  },

  async logout(req, res, next) {
    //3. Response
    res.status(200).json({ user: null, auth: false });
  },
};

const getDetailsByCusId = async (customer_id) => {
  let subscribedProducts = null;

  if (customer_id) {
    const subscriptions = await stripe.subscriptions.list({
      customer: customer_id,
    });

    subscribedProducts = await Promise.all(
      subscriptions.data.map(async (subscription) => {
        const product = await stripe.products.retrieve(
          subscription.items.data[0].price.product
        );

        return {
          productId: product.id,
          priceId: product.default_price?.id,
          name: product.name,
          description: product.description,
          features: product.features,
          price: subscription?.plan?.amount / 100,
          subscriptionId: subscription.id,
          currency: subscription?.plan?.currency,
          start: subscription.current_period_start * 1000,
          expire: subscription.current_period_end * 1000,
        };
      })
    );
  }

  return subscribedProducts;
};

module.exports = authController;