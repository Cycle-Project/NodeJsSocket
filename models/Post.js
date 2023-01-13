const mongoose = require('mongoose');
const unique = require('mongoose-unique-validator');
const validate = require('mongoose-validator');

const CommentValidator = [
  validate({
    validator: 'isLength',
    arguments: [0, 140],
    message: 'Comment must not exceed {ARGS[1]} characters.'
  })
];

// Define the database model
const PostSchema = new mongoose.Schema({
  comment: {
    type: String,
    required: [false, 'comment  is not required.'],
    validate: CommentValidator
  },
  like: {
    type: String,
    required: false
  },
  share: {
    type: Array,
    required: false
  },
}
);

// Use the unique validator plugin
PostSchema.plugin(unique, { message: 'That {PATH} is already taken.' });

module.exports = mongoose.model('post', PostSchema);