const { userModel, tokenBlacklistModel, courseModel } = require('../models')
const { createToken, verifyToken } = require('../utils/jwt');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

function signin(req, res) {
    const token = createToken({ userID: req.user.id });
    res.cookie('auth-cookie', token).redirect('/');
}

module.exports = {
    get: {
        login: (req, res) => {
            res.render('login.hbs')
        },
        register: (req, res) => {
            res.render('register')
        },
        logout: (req, res, next) => {
            const token = req.token || req.cookies['auth-cookie'];
            if (!token) {
                res.redirect('/');
                return;
            }
            tokenBlacklistModel.create({ token })
                .then(() => {
                    res.clearCookie('auth-cookie');
                    res.status(200).redirect('/');
                })
                .catch(err => next(err))
        }
    },
    post: {
        login: (req, res, next) => {
            const { username, password } = req.body;
            userModel.findOne({ username })
                .then(user => {
                    if (!user) {
                        res.render('login', { errors: { username: `This user ${username} not exist!` } });
                        return;
                    }
                    Promise.all([user, user.matchPassword(password)])   //promise in promise - mot nested
                        .then(([user, match]) => {
                            if (!match) {
                                res.render('login', { errors: { password: 'Password mismatch!' } });
                                return;
                            }
                            req.user = user;
                            // const token = createToken({ userID: user.id });
                            // res.cookie('auth-cookie', token).redirect('/');
                            signin(req, res);
                            return;
                        })
                        .catch(err => console.log(err))
                })
                .catch(err => console.log(err))
        },
        register: (req, res, next) => {
            const { username, password, repeatPassword } = req.body;
            if (password !== repeatPassword) {
                res.render('register.hbs', { errors: { password: 'Password and repeatpassword don\'t match' } })
                Promise.reject('Password and repeatpassword don\'t match')
                return;
            }
            userModel.create({ username, password })
                .then((user) => {
                    req.user = user;
                    signin(req, res);
                    return;
                })
                .catch(err => {
                    if (err.code = 11000 && err.name === 'MongoError') {
                        res.render('register', { errors: { username: 'User already exist' } })
                        return;
                    }
                    if (err.name === 'ValidationError') {
                        res.render('register.hbs', { errors: err.errors });
                        console.log(err)
                        return;
                    }
                    next(err);
                })
        }
    }
}