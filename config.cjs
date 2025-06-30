// config.js
const fs = require("fs");
require("dotenv").config();

const config = {
  SESSION_ID: "HANS-BYTE~A3VGCb7Q#g9F8pX4qSRSK--2aFC-z6KQVB8FqLRQjsBNyj5lWKQk",
  PREFIX: '.',

  AUTO_STATUS_SEEN: false,
  AUTO_STATUS_REPLY: false,
  STATUS_READ_MSG: '',
  VERSION: "1.0.0",
  HEROKU_APP_NAME: process.env.HEROKU_APP_NAME || "LUNA-MD",
  OMDB_API_KEY: process.env.OMDB_API_KEY || "5e339fb7",

  ANTI_DELETE: false,
  ANTI_DELETE_PATH: "inbox",

  AUTO_DL: false,
  AUTO_READ: false,
  AUTO_TYPING: false,
  AUTO_RECORDING: false,
  ALWAYS_ONLINE: false,
  AUTO_REACT: false,

  /* auto block only for 212 */
  AUTO_BLOCK: false,
  REJECT_CALL: false,
  NOT_ALLOW: false,

  MODE: "public",
  BOT_NAME: "LUNA MD",
  MENU_IMAGE: "",
  DESCRIPTION: "LUNA MD BY HANS TECH",
  OWNER_NAME: "HANS_BYTE",
  OWNER_NUMBER: "237696900612",
  GEMINI_KEY: "AIzaSyCUPaxfIdZawsKZKqCqJcC-GWiQPCXKTDc",
  WELCOME: false,
};

module.exports = config;
