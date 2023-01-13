const mongoose = require('mongoose');
const RouteSchema = new mongoose.Schema({
    positions: [{
        latitude: {
            type: String,
            required: [false, 'please add latitude'],
            unique: false,
            trim: true,
            maxlength: [20, 'latitude must be less than 10 chars']
        },
        longitude: {
            type: String,
            required: [false, 'please add longitude'],
            unique: false,
            trim: true,
            maxlength: [20, 'longitude must be less than 10 chars']
        },
    }],
    userMadeId: {
        type: String,
        required: true
    }

});

module.exports = mongoose.model('Route', RouteSchema);