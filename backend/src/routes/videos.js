const express = require('express');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const Video = require('../models/Video');
const User = require('../models/User');
const router = express.Router();

const storage = multer.diskStorage({
  destination: './uploads/videos',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

router.post('/', auth, upload.single('video'), async (req, res) => {
  const { description } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user.isVerified) return res.status(403).json({ error: 'Email not verified' });
    const video = new Video({
      user: req.user.id,
      videoUrl: `/uploads/videos/${req.file.filename}`,
      description,
    });
    await video.save();
    res.status(201).json(video);
  } catch (err) {
    res.status(400).json({ error: 'Upload failed' });
  }
});

router.get('/', async (req, res) => {
  const videos = await Video.find().populate('user', 'username').sort({ createdAt: -1 });
  res.json(videos);
});

// Like a video
router.post('/:id/like', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.isVerified) return res.status(403).json({ error: 'Email not verified' });
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });
    if (video.likes.includes(req.user.id)) {
      return res.status(400).json({ error: 'You already liked this video' });
    }
    video.likes.push(req.user.id);
    await video.save();
    res.json({ likes: video.likes.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to like video' });
  }
});

// Unlike a video
router.post('/:id/unlike', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.isVerified) return res.status(403).json({ error: 'Email not verified' });
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });
    if (!video.likes.includes(req.user.id)) {
      return res.status(400).json({ error: 'You have not liked this video' });
    }
    video.likes = video.likes.filter(uid => uid.toString() !== req.user.id);
    await video.save();
    res.json({ likes: video.likes.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to unlike video' });
  }
});

module.exports = router;
