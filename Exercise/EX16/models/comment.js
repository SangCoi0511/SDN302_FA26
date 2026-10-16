const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    body: {
        type: String,
        required: [true, 'Comment body is required.']
    },
    date: {
        type: Date,
        default: Date.now
    },
    article: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article'
    }
});

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;
