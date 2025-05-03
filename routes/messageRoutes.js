const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { sendMessages } = require("../controllers/messageController");
const upload = require("../config/upload");
const Message = require("../models/messageModel");
const nanoid = require("nanoid");
const router = express.Router();
const cryptr = require('../config/crypt.conf')

/**
 * @route POST api/messages/send_to/:frnduid
 * @param
 */
router.post('/send_to/:frnduid', authMiddleware, sendMessages);

router.post('/upload-image', upload.single('upload_image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const imageUrl = `/storage/public/chat/${req.file.filename}`;

    const sender = req.body.sid;
    const reciever = req.body.rid;
    const text = req.body.text || '';
    const send_at = req.body.send_at
    const isImage = imageUrl

    const newMessage1 = new Message({
        mid: nanoid(),
        sender,
        reciever,
        text: cryptr.encrypt(text),
        isImage,
        send_at,
    });

    const newMessage = await newMessage1.save();
    res.json({ success: true, url: imageUrl, messageId: newMessage.mid });
})

/**
 * @route GET api/messages/recieve
 * @description This endpoint returns a message and gets logged in user uid through jwt token auth.
 * @header {string} uid - Gets logged-in user uid through authmiddleware.
 * @param {string} frnduid - Friend uid to save messages.
 */
// router.get('recieve/:frnduid', authMiddleware, recieveMessages);

module.exports = router;