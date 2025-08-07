"use strict";

const keytokenModel = require("../models/keytoken.model");
const { Types } = require("mongoose");

class KeyTokenService {
  static createKeyToken = async ({
    userId,
    publicKey,
    privateKey,
    refreshToken,
  }) => {
    try {
      /* DÀNH CHO CÁC HỆ THỐNG LỚN
        const publicKeyString = publicKey.toString();
      const tokens = await keytokenModel.create({
        user: userId,
        publicKey: publicKeyString,
      });
      return tokens ? tokens.publicKey : null;
       */

      //Level 0
      // const tokens = await keytokenModel.create({
      //   user: userId,
      //   publicKey,
      //   privateKey,
      // });
      // return tokens ? tokens.publicKey : null;

      //level 1
      const filter = { user: userId },
        update = {
          publicKey,
          privateKey,
          refreshTokensUsed: [],
          refreshToken,
        },
        options = {
          upsert: true,
          new: true,
        };

      const tokens = await keytokenModel.findOneAndUpdate(
        filter,
        update,
        options
      );
      return tokens ? tokens.publicKey : null;
    } catch (error) {
      return error;
    }
  };

  static findByUserId = async (userId) => {
    return await keytokenModel.findOne({ user: new Types.ObjectId(userId) });
  };

  static removeKeyById = async (id) => {
    return await keytokenModel.deleteOne({ _id: id });
  };

  static findByRefreshTokenUsed = async (refreshToken) => {
    return await keytokenModel
      .findOne({ refreshTokensUsed: refreshToken })
      .lean();
  };

  static findByRefreshToken = async (refreshToken) => {
    return await keytokenModel.findOne({ refreshToken });
  };

  static deleteKeyById = async (userId) => {
    return await keytokenModel.deleteOne({ user: userId });
  };

  static updateRefreshTokenUsed = async (
    userId,
    { newRefreshToken, oldRefreshToken }
  ) => {
    return await keytokenModel.updateOne(
      { user: userId },
      {
        $set: { refreshToken: newRefreshToken },
        $addToSet: { refreshTokensUsed: oldRefreshToken },
      }
    );
  };
}

module.exports = KeyTokenService;
