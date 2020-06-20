const userModel = require('./user')
const courseModel = require('./course.js');
const tokenBlacklistModel = require('./token-blacklist')
module.exports = { courseModel, userModel, tokenBlacklistModel }