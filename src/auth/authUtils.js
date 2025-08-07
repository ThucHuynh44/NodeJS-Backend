"use strict";

const JWT = require("jsonwebtoken");
const { asyncHandler } = require("../helpers/asyncHandler");
const { AuthFailureError, NotFoundError } = require("../core/error.response");
//service
const KeyTokenService = require("../services/keyToken.service");

const HEADER = {
  API_KEY: "x-api-key",
  CLIENT_ID: "x-client-id",
  AUTHORIZATION: "authorization",
  REFRESHTOKEN: "x-rtoken-id",
};

const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    // accessToken
    const accessToken = await JWT.sign(payload, publicKey, {
      expiresIn: "2 days",
    });

    const refreshToken = await JWT.sign(payload, privateKey, {
      expiresIn: "7 days",
    });

    //verify sử dụng publicToken
    JWT.verify(accessToken, publicKey, (err, decode) => {
      if (err) {
        console.log(`error verify::`, err);
      } else {
        console.log(`decode verify::`, decode);
      }
    });

    return { accessToken, refreshToken };
  } catch (error) {
    return error;
  }
};

// Phiên bản này còn bị vấn đề là khi access token hết hạn thì vẫn lấy access token để login vào
const authentication = asyncHandler(async (req, res, next) => {
  /*
    1 - Check userId missing??
    2 - get accessToken
    3 - verifyToken
    4 - check user in dbs
    5 - check keyStore with this userId?
    6 - Ok all => return next()
  */

  // 1 - Check userId missing??
  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) throw new AuthFailureError("Invalid Request");
  // 2 - get accessToken
  const keyStore = await KeyTokenService.findByUserId(userId);
  if (!keyStore) throw new NotFoundError("Not found keyStore");
  // 3 - verifyToken
  const accessToken = req.headers[HEADER.AUTHORIZATION];
  if (!accessToken) throw new AuthFailureError("Invalid Request");
  // 4 - check user in dbs
  // 5 - check keyStore with this userId?
  // 6 - Ok all => return next()
  try {
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
    if (userId !== decodeUser.userId)
      throw new AuthFailureError("Invalid Userid");
    req.keyStore = keyStore;
    return next();
  } catch (error) {
    throw error;
  }
});

const authenticationV2 = asyncHandler(async (req, res, next) => {
  /*
    1 - Check userId missing??
    2 - get accessToken
    3 - verifyToken
    4 - check user in dbs
    5 - check keyStore with this userId?
    6 - Ok all => return next()
  */

  // 1 - Check userId missing??
  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) throw new AuthFailureError("Invalid Request");
  // 2 - get accessToken
  const keyStore = await KeyTokenService.findByUserId(userId);
  if (!keyStore) throw new NotFoundError("Not found keyStore");
  console.log(userId, keyStore);
  // 3 - verifyToken
  if (req.headers[HEADER.REFRESHTOKEN]) {
    try {
      const refreshToken = req.headers[HEADER.REFRESHTOKEN];
      const decodeUser = JWT.verify(refreshToken, keyStore.privateKey);
      if (userId !== decodeUser.userId)
        throw new AuthFailureError("Invalid Userid");
      req.keyStore = keyStore;
      req.user = decodeUser;
      req.refreshToken = refreshToken;
      return next();
    } catch (error) {
      throw error;
    }
  }
  const accessToken = req.headers[HEADER.AUTHORIZATION];
  if (!accessToken) throw new AuthFailureError("Invalid Request");
  // 4 - check user in dbs
  // 5 - check keyStore with this userId?
  // 6 - Ok all => return next()
  try {
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
    if (userId !== decodeUser.userId)
      throw new AuthFailureError("Invalid Userid");
    req.user = decodeUser;
    req.keyStore = keyStore;
    return next();
  } catch (error) {
    throw error;
  }
});

const verifyJWT = async (token, keySecret) => {
  return await JWT.verify(token, keySecret);
};

module.exports = {
  createTokenPair,
  authentication,
  authenticationV2,
  verifyJWT,
};
