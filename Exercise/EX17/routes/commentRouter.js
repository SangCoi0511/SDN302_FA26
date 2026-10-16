const express = require('express');
const commentController = require('../controllers/commentController');
const commentRouter = express.Router();

commentRouter.use(express.json());
commentRouter.use(express.urlencoded({ extended: true }));

commentRouter.route('/')
    .get(commentController.findAll)
    .post(commentController.create)
    .put((req, res) => {
        res.status(403).json('PUT operation not supported on /comments');
    })
    .delete((req, res) => {
        res.status(403).json('DELETE operation not supported on /comments');
    });

commentRouter.route('/:id')
    .get(commentController.findById)
    .post((req, res) => {
        res.status(403).end('POST operation not supported on /comments/' + req.params.id);
    })
    .put(commentController.update)
    .delete(commentController.delete);

module.exports = commentRouter;
