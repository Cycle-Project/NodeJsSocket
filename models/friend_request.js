const mongoose = require('mongoose');

const friendRequestSchema = new mongoose.Schema({
    sender: {
        type: String,
        required: true
    },
    recipient: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    }
});

module.exports = mongoose.model('FriendRequest', friendRequestSchema);