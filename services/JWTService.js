const jwt = require("jsonwebtoken");
const { ACCESS_TOKEN_SECRET } = require("../config/index");
const { REFRESH_TOKEN_SECRET } = require("../config/index");
const RefreshToken = require("../models/token");

class JWTService {
  //sign access token
  static signAccessToken(payload, expiryTime, secret = ACCESS_TOKEN_SECRET) {
    return jwt.sign(payload, secret);
  }

  //sign refresh token
  static signRefreshToken(payload, expiryTime, secret = REFRESH_TOKEN_SECRET) {
    return jwt.sign(payload, secret, { expiresIn: expiryTime });
  }

  //verify access token
  static verifyAccessToken(token, secret = ACCESS_TOKEN_SECRET) {
    return jwt.verify(token, secret);
  }

  //verify refresh token
  static verifyRefreshToken(token, secret = REFRESH_TOKEN_SECRET) {
    return jwt.verify(token, secret);
  }

  //store refresh token in db
  static async storeRefreshToken(token, userId) {
    try {
      const newToken = new RefreshToken({
        token: token,
        userId: userId,
      });

      //store in database
      await newToken.save();
    } catch (error) {
      console.log(error);
    }
  }

  //update refresh token in db
  static async updateRefreshToken(token, userId) {
    try {
      await RefreshToken.updateOne(
        { userId: userId },
        { token: token },
        { upsert: true }
      );
    } catch (error) {
      return next(error);
    }
  }

  //delete refresh token from db
  static async deteleRefreshToken(token) {
    try {
      await RefreshToken.deleteOne({ token: token });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = JWTService;
