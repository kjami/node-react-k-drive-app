/* global require, module, process */
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const validateEmail = (value) => {
    if (!validator.isEmail(value)) {
        throw new Error('Value provided is not an email.');
    }
}

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            validateEmail(value);
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        validate(value) {
            if (typeof (value) == 'string' && value.toLowerCase().includes('password')) {
                throw new Error('Password is not valid')
            }
        }
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    drives: [{
        type: {
            type: String,
            required: true,
            enum: ['gdrive', 'onedrive']
        },
        email: {
            type: String,
            required: true,
            validate(value) {
                validateEmail(value);
            }
        }
    }],
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
});

userSchema.methods.generateAuthToken = async function () {
    // eslint-disable-next-line no-invalid-this
    const user = this;
    // eslint-disable-next-line no-process-env
    const token = await jwt.sign({ email: user.email }, process.env.JWT_SECRET_KEY);
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
}

userSchema.statics.findUserByCredentials = async (email, password) => {
    // eslint-disable-next-line no-use-before-define
    const user = User.findOne({ email: email });
    if (!user) {
        throw new Error(`Unable to find user with email ${email}`);
    }
    
    const isValid = await bcrypt.compare(user.password, password);
    if (!isValid) {
        throw new Error('Passwords do not match');
    }

    return user;
}

userSchema.pre('save', async function (next) {
    // eslint-disable-next-line no-invalid-this
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
})

const User = mongoose.model('User', userSchema);

module.exports = User;