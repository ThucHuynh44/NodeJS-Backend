"use trict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { createTokenPair, verifyJWT } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const {
  BadRequestError,
  AuthFailureError,
  ForbiddenError,
} = require("../core/error.response");

//service
const keyTokenService = require("./keyToken.service");
const { findByEmail } = require("./shop.service");

const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class AccessService {
  /*
    check this token used?
  */

  static handlerRefreshToken = async (refreshToken) => {
    //Check token used or not
    const foundToken = await keyTokenService.findByRefreshTokenUsed(
      refreshToken
    );
    // if has
    if (foundToken) {
      //decode to check who is accessing?
      const { userId, email } = await verifyJWT(
        refreshToken,
        foundToken.privateKey
      );
      console.log({ userId, email });
      // Remove all token in keyStore
      await keyTokenService.deleteKeyById(userId);
      throw new ForbiddenError("Something wrong happen!! Pls relogin");
    }

    //if No
    const holderToken = await keyTokenService.findByRefreshToken(refreshToken);
    if (!holderToken) throw new AuthFailureError("Shop not registered");

    // verifyToken
    const { userId, email } = await verifyJWT(
      refreshToken,
      holderToken.privateKey
    );
    console.log("[2]--", { userId, email });
    //Check userId
    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new AuthFailureError("Shop not registered");

    // create a pair keyToken
    const tokens = await createTokenPair(
      { userId, email },
      holderToken.publicKey,
      holderToken.privateKey
    );
    // update token
    /*
    //CODE này lỗi thời r
    // await holderToken.update({
    //   $set: {
    //     refreshToken: tokens.refreshToken,
    //   },
    //   $addToSet: {
    //     refreshTokenUsed: refreshToken, // Token used to get new token
    //   },
    // });
    */

    await keyTokenService.updateRefreshTokenUsed(holderToken.user, {
      refreshToken: tokens.refreshToken,
      refreshTokenUsed: refreshToken,
    });

    return {
      user: { userId, email },
      tokens,
    };
  };

  /* 
    // 1 - Check email in dbs
    // 2 - match password
    // 3 - Create Accept token and refresh token and save
    // 4 - generate tokens
    // 5 - get data return login
  */

  static login = async ({ email, password, refreshToken = null }) => {
    // 1 - Check email in dbs
    const foundShop = await findByEmail({ email });
    if (!foundShop) {
      throw new BadRequestError("Shop not registered");
    }

    // 2 - match password
    const match = bcrypt.compare(password, foundShop.password);
    if (!match) throw new AuthFailureError("Authentication error");

    // 3 - Create Access token and refresh token and save
    //created privateKey and publicKey
    const privateKey = crypto.randomBytes(64).toString("hex");
    const publicKey = crypto.randomBytes(64).toString("hex");
    // 4 - generate tokens
    // created token pair
    const { _id: userId } = foundShop;
    const tokens = await createTokenPair(
      { userId, email },
      publicKey,
      privateKey
    );

    // 5 - get data return login
    await keyTokenService.createKeyToken({
      refreshToken: tokens.refreshToken,
      privateKey,
      publicKey,
      userId,
    });
    return {
      shop: getInfoData({
        fields: ["_id", "name", "email"],
        object: foundShop,
      }),
      tokens,
    };
  };

  static signUp = async ({ name, email, password }) => {
    // try {
    //step 1: check email exist??
    // .lean() giups truy vấn nhanh hơn, còn hỏi tại sao thì search chatGPT cho nhanh

    const holderShop = await shopModel.findOne({ email }).lean();

    if (holderShop) {
      throw new BadRequestError("Error: Shop already registered!");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newShop = await shopModel.create({
      name,
      email,
      password: passwordHash,
      roles: [RoleShop.SHOP],
    });

    if (newShop) {
      /*
        THUẬT TOÁN NÀY THƯỜNG DÙNG CHO CÁC HỆ THỐNG LỚN
        // created privateKey: để cho người dùng nhớ, publicKey: lưu vào hệ thống
        const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
          modulusLength: 4096,
          // type:pks1 call as Public key CrytoGraphy Standars
          publicKeyEncoding: {
            type: "pkcs1",
            format: "pem",
          },
          privateKeyEncoding: {
            type: "pkcs1",
            format: "pem",
          },
        });
        const publicKeyString = await keyTokenService.createKeyToken({
          userId: newShop._id,
          publicKey,
        });
         */

      //created privateKey and publicKey
      const privateKey = crypto.randomBytes(64).toString("hex");
      const publicKey = crypto.randomBytes(64).toString("hex");

      console.log({ privateKey, publicKey }); //Save collection keyStore
      const keyStore = await keyTokenService.createKeyToken({
        userId: newShop._id,
        publicKey,
        privateKey,
      });

      if (!keyStore) {
        throw new BadRequestError("Error: keyStore error");
        // return {
        //   code: "xxxx",
        //   message: "keyStore error",
        // };
      }

      // created token pair
      const tokens = await createTokenPair(
        { userId: newShop._id, email },
        publicKey,
        privateKey
      );

      console.log(`created Token Success::`, tokens);

      return {
        code: 201,
        metadata: {
          shop: getInfoData({
            fields: ["_id", "name", "email"],
            object: newShop,
          }),
          tokens,
        },
      };
    }

    return {
      code: 200,
      metadata: null,
    };
    // } catch (error) {
    //   console.error(error);
    //   return {
    //     code: "xxx",
    //     message: error.message,
    //     status: "error",
    //   };
    // }
  };

  //DÀNH CHO HỆ THỐNG LỚN

  //       if (!publicKeyString) {
  //         return {
  //           code: "xxxx",
  //           message: "publicKeystring error",
  //         };
  //       }

  //       console.log(`publicKeyString::`, publicKeyString);
  //       const publicKeyObject = crypto.createPublicKey(publicKeyString);
  //       console.log(`publicKeyObject::`, publicKeyObject);

  //       // created token pair
  //       const tokens = await createTokenPair(
  //         { userId: newShop, email },
  //         publicKeyObject,
  //         privateKey
  //       );

  //       console.log(`created Token Success::`, tokens);

  //       return {
  //         code: 201,
  //         metadata: {
  //           shop: getInfoData({
  //             fields: ["_id", "name", "email"],
  //             object: newShop,
  //           }),
  //           tokens,
  //         },
  //       };
  //     }

  //     return {
  //       code: 200,
  //       metadata: null,
  //     };
  //   } catch (error) {
  //     return {
  //       code: "xxx",
  //       message: error.message,
  //       status: "error",
  //     };
  //   }
  // };
  static logout = async (keyStore) => {
    const delKey = await keyTokenService.removeKeyById(keyStore._id);
    console.log({ delKey });
    return delKey;
  };
}

module.exports = AccessService;
