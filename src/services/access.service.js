"use trict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const keyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const { BadRequestError } = require("../core/error.response");

const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class AccessService {
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
        { userId: newShop, email },
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
}

module.exports = AccessService;
