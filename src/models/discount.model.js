"use strict";

const { Schema, model } = require("mongoose");
const DOCUMENT_NAME = "Discount";
const COLLECTION_NAME = "discounts";

// Declare the Schema of the Mongo model
var discountSchema = new Schema(
  {
    disocunt_name: { type: String, required: true },
    discount_description: { type: String, required: true },
    disocunt_type: { type: String, default: "fixed_amount" }, //percentage
    disocunt_value: { type: Number, required: true }, // 10.000 , 10
    disocunt_code: { type: String, required: true }, // discountCode
    disocunt_start_date: { type: Date, required: true }, //Ngay bat dau
    disocunt_end_date: { type: Date, required: true }, // Ngay ket thuc
    disocunt_max_uses: { type: Number, required: true }, // so luong discount duoc ap dung
    disocunt_uses_count: { type: Number, required: true }, // so discount da su dung
    disocunt_users_used: { type: Array, default: [] }, // ai da su dung
    disocunt_max_uses_per_user: { type: Number, required: true }, // so luong cho phep toi da duoc su dung
    disocunt_min_order_value: { type: Number, required: true },
    disocunt_shopId: { type: Schema.Types.ObjectId, ref: "Shop" },

    disocunt_is_active: { type: Boolean, default: true },
    disocunt_applies_to: {
      type: String,
      required: true,
      enum: ["all", "specific"],
    },
    disocunt_product_ids: { type: Array, default: [] }, //so san pham duoc ap dung
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

//Export the model
module.exports = {
  inventory: model(DOCUMENT_NAME, discountSchema),
};
