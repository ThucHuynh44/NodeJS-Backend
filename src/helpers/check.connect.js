"use trict";

const mongoose = require("mongoose");
const os = require("os");
const process = require("process");
const _SECOND = 5000;
//count connect
const countConnect = () => {
  const numConnection = mongoose.connections.length;
  console.log(`Number of connections:: ${numConnection}`);
};

//check overload
const checkOverLoad = () => {
  setInterval(() => {
    const numConnection = mongoose.connections.length;
    const numCores = os.cpus().length;
    const memoryUsage = process.memoryUsage().rss;
    //example maximum number of connnections based on number of cores
    const maxConnnections = numCores * 5;

    console.log(`Num Connection:: ${numConnection}`);
    console.log(`Memory Usage:: ${memoryUsage / 1024 / 1024} MB`);

    if (numConnection > maxConnnections) {
      console.log(`Connection overload detected`);
      // notify.send(....)
    }
  }, _SECOND); //Monitor every 5s
};

module.exports = {
  countConnect,
  checkOverLoad,
};
