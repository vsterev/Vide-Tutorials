const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please enter username !'],
        unique: [true, 'User already exists !'],
        validate: [
            {
                validator: (v) => {
                    return /[a-zA-Z0-9]{5,}/.test(v);
                },
                message: props => `${props.value} is not a valid username - Should contains only digit or letter with minimum length 5`
            }
        ]
    },
    password: {
        type: String,
        required: [true, 'Please enter password!'],
        match: [/^[a-zA-Z0-9]{5,}$/, 'Password should contains minimum 5 digits from numbers or letters']
    },
    courses: [{ type: mongoose.Types.ObjectId, ref: 'Courses' }]
})
userSchema.methods = {
    matchPassword: function (password) {
        return bcrypt.compare(password, this.password) //password verification in model
    }
}
userSchema.pre('save', function (next) { //hash when saving password
    if (this.isModified('password')) {
        const saltGenerate = bcrypt.genSalt(9)
        saltGenerate
            .then(salt => {
                const hash = bcrypt.hash(this.password, salt)
                Promise.all([salt, hash])
                    .then(([salt, hash]) => {
                        this.password = hash;
                        next();
                    })
                    .catch(err => next(err))
            })
            .catch(err => next(err))
        return;
    }
    next();
})
userSchema.pre('findOneAndUpdate', function (next) {
    if (this._update['password']) {
        const saltGenerate = bcrypt.genSalt(9)
        saltGenerate
            .then(salt => {
                const hash = bcrypt.hash(this._update['password'], salt)
                Promise.all([salt, hash])
                    .then(([salt, hash]) => {
                        this._update['password'] = hash;
                        next();
                    })
                    .catch(err => next(err))
            })
            .catch(err1 => next(err1))
        return;
    }
    next();
})
module.exports = mongoose.model('User', userSchema);