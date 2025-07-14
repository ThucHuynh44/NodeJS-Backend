"use strict";

const _ = require("lodash");

// hàm này trả về các thông tin cần thiết của đối tượng cần in ra
const getInfoData = ({ fields = [], object = {} }) => {
  return _.pick(object, fields);
};

module.exports = {
  getInfoData,
};
