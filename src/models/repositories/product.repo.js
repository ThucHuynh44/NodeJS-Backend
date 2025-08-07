"use strict";

const {
  product,
  electronic,
  clothing,
  furniture,
} = require("../../models/product.model");
const { Types } = require("mongoose");
const { getSelectData, unGetSelectData } = require("../../utils");

const findAllDraftForShop = async ({ query, skip = 0, limit = 50 }) => {
  return await queryProduct({ query, skip, limit });
};

const findAllPublishForShop = async ({ query, skip = 0, limit = 50 }) => {
  return await queryProduct({ query, skip, limit });
};

const searchProductByUser = async ({ keySearch }) => {
  const regexSearch = new RegExp(keySearch);
  const results = await product
    .find(
      {
        isPublished: true,
        $text: { $search: regexSearch },
      },
      { score: { $meta: "textScore" } }
    )
    .sort({ score: { $meta: "textScore" } })
    .lean();
  return results;

  // const results = await product
  //   .find(
  //     { $text: { $search: keySearch } }, // cần là string
  //     { score: { $meta: "textScore" } }
  //   )
  //   .sort({ score: { $meta: "textScore" } })
  //   .lean();
  // return results;
};

const publishProductByShop = async ({ product_shop, product_id }) => {
  const result = await product.updateOne(
    {
      product_shop: new Types.ObjectId(product_shop),
      _id: new Types.ObjectId(product_id),
    },
    {
      $set: {
        isDraft: false,
        isPublished: true,
      },
    }
  );

  return result.modifiedCount; // trả về số bản ghi bị sửa
};

const unPublishProductByShop = async ({ product_shop, product_id }) => {
  const result = await product.updateOne(
    {
      product_shop: new Types.ObjectId(product_shop),
      _id: new Types.ObjectId(product_id),
    },
    {
      $set: {
        isDraft: true,
        isPublished: false,
      },
    }
  );

  return result.modifiedCount; // trả về số bản ghi bị sửa
};

const findAllProducts = async ({ limit, sort, page, filter, select }) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
  const products = await product
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean();

  return products;
};

const findProduct = async ({ product_id, unselect }) => {
  return await product.findById(product_id).select(unGetSelectData(unselect));
};

const updateProductById = async ({
  productId,
  bodyUpdate,
  model,
  isNew = true,
}) => {
  return await model.findByIdAndUpdate(productId, bodyUpdate, { new: isNew });
};

const queryProduct = async ({ query, skip, limit }) => {
  return await product
    .find(query)
    .populate("product_shop", "name email -_id")
    .sort({ updateAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
};

module.exports = {
  findAllDraftForShop,
  publishProductByShop,
  findAllPublishForShop,
  unPublishProductByShop,
  searchProductByUser,
  findAllProducts,
  findProduct,
  updateProductById,
};
