const express = require('express');
const fs = require('node:fs/promises');
const path = require('node:path');

const router = express.Router();
const databasePath = path.join(__dirname, '..', 'db.json');

async function readVideos() {
    const database = JSON.parse(await fs.readFile(databasePath, 'utf8'));
    return database.videos;
}

async function writeVideos(videos) {
    const database = JSON.parse(await fs.readFile(databasePath, 'utf8'));
    database.videos = videos;
    await fs.writeFile(databasePath, `${JSON.stringify(database, null, 2)}\n`);
}

function validateVideo(video) {
    if (!video || typeof video !== 'object' || Array.isArray(video) || !video.title || !video.video) {
        const error = new Error('Video title and video URL are required');
        error.statusCode = 400;
        throw error;
    }
}

router.get('/', async (req, res, next) => {
    try {
        res.json(await readVideos());
    } catch (err) {
        next(err);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const video = (await readVideos()).find((item) => item.id === Number(req.params.id));
        if (!video) {
            const error = new Error('Video not found');
            error.statusCode = 404;
            throw error;
        }
        res.json(video);
    } catch (err) {
        next(err);
    }
});

router.post('/', async (req, res, next) => {
    try {
        validateVideo(req.body);
        const videos = await readVideos();
        const video = {
            ...req.body,
            id: videos.reduce((highestId, item) => Math.max(highestId, item.id), 0) + 1,
        };
        videos.push(video);
        await writeVideos(videos);
        res.status(201).json(video);
    } catch (err) {
        next(err);
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        const videos = await readVideos();
        const index = videos.findIndex((item) => item.id === Number(req.params.id));
        if (index === -1) {
            const error = new Error('Video not found');
            error.statusCode = 404;
            throw error;
        }
        const updatedVideo = { ...videos[index], ...req.body, id: videos[index].id };
        validateVideo(updatedVideo);
        videos[index] = updatedVideo;
        await writeVideos(videos);
        res.json(updatedVideo);
    } catch (err) {
        next(err);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const videos = await readVideos();
        const index = videos.findIndex((item) => item.id === Number(req.params.id));
        if (index === -1) {
            const error = new Error('Video not found');
            error.statusCode = 404;
            throw error;
        }
        const [deletedVideo] = videos.splice(index, 1);
        await writeVideos(videos);
        res.json(deletedVideo);
    } catch (err) {
        next(err);
    }
});

module.exports = router;