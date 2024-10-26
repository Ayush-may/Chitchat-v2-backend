const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { sendMessages } = require("../controllers/messageController");
const router = express.Router();

/**
 * @route POST api/messages/send_to/:frnduid
 * @param
 */
router.post('/send_to/:frnduid', authMiddleware, sendMessages);

/**
 * @route GET api/messages/recieve
 * @description This endpoint returns a message and gets logged in user uid through jwt token auth.
 * @header {string} uid - Gets logged-in user uid through authmiddleware.
 * @param {string} frnduid - Friend uid to save messages.
 */
// router.get('recieve/:frnduid', authMiddleware, recieveMessages);

module.exports = router;