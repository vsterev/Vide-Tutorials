const mongoose = require('mongoose');
const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please enter a title !'],
        match: [/^(\w\s?){4,}$/, 'Name should contains not less than 4 english letter, numbers and whitespase!']
    },
    description: {
        type: String,
        maxlength: [50, 'It is allow maximum 50 characters!']
    } || 'No description',
    imageUrl: {
        type: String,
        required: [true, 'Please add image !'],
        match: [/^(https?)\:\/\/.*/, 'Url should begin with http or https!']
    } || 'https://www.imghack/com/id?389872',
    isPublic: {
        type: Boolean
    },
    createdAt: {
        type: Date
    },
    users: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    creatorId: { type: mongoose.Types.ObjectId, ref: 'User' }
})

module.exports = mongoose.model('Course', courseSchema);