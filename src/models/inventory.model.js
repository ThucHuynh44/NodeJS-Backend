"use strict";

const { Schema, model } = require("mongoose");
const DOCUMENT_NAME = "Inventory";
const COLLECTION_NAME = "Inventories";

// Declare the Schema of the Mongo model
var inventorySchema = new Schema(
  {
    inven_productId: {
      type: Schema.ObjectId,
      ref: "Product",
    },
    inven_location: {
      type: String,
      default: "unKnow",
    },
    inven_stock: {
      type: Number,
      required: true,
    },
    inven_shopId: {
      type: Schema.ObjectId,
      ref: "Shop",
    },
    inven_reservations: {
      type: Array,
      default: [],
    },
    /*
      cartId:,
      stock:1,
      createOn:
    */
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

//Export the model
module.exports = {
  inventory: model(DOCUMENT_NAME, inventorySchema),
};
