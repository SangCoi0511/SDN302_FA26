const express = require('express');
const videos = require('./videos');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/videos', (req, res) => {
  res.status(200).json(videos);
});

app.get('/videos/:id', (req, res) => {
  const videoId = Number(req.params.id);
  const video = videos.find((item) => item.id === videoId);

  if (!video) {
    return res.status(404).json({ message: 'Video not found' });
  }

  return res.status(200).json(video);
});

app.post('/videos', (req, res) => {
  const { title, date, author, video, content } = req.body;

  if (!title || !date || !author || !video || !content) {
    return res.status(400).json({ message: 'Missing required video fields' });
  }

  const newVideo = {
    id: videos.length ? videos[videos.length - 1].id + 1 : 1,
    title,
    date,
    author,
    video,
    content,
    comments: [],
  };

  videos.push(newVideo);
  return res.status(201).json(newVideo);
});

app.put('/videos/:id', (req, res) => {
  const videoId = Number(req.params.id);
  const videoIndex = videos.findIndex((item) => item.id === videoId);

  if (videoIndex === -1) {
    return res.status(404).json({ message: 'Video not found' });
  }

  const updatedVideo = {
    ...videos[videoIndex],
    ...req.body,
    id: videoId,
  };

  videos[videoIndex] = updatedVideo;
  return res.status(200).json(updatedVideo);
});

app.delete('/videos/:id', (req, res) => {
  const videoId = Number(req.params.id);
  const videoIndex = videos.findIndex((item) => item.id === videoId);

  if (videoIndex === -1) {
    return res.status(404).json({ message: 'Video not found' });
  }

  const [deletedVideo] = videos.splice(videoIndex, 1);
  return res.status(200).json({
    message: 'Video deleted successfully',
    data: deletedVideo,
  });
});

module.exports = app;