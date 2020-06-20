const jwt = require('./jwt');
const { userModel, tokenBlacklistModel } = require('../models')

function auth(redirectUnauthenticated = true) {
    return function (req, res, next) {
        const token = req.cookies['auth-cookie'];
        // if (!token) {
        //     res.redirect('/');
        //     return;
        // }
        Promise.all([
            jwt.verifyToken(token),
            tokenBlacklistModel.findOne({ token })
        ]).then(([data, blackListToken]) => {
            if (blackListToken) {
                return Promise.reject(new Error('blacklisted token'))
            }
            userModel.findById(data.userID)
                .then(user => {
                    req.user = user;
                    next();
                })
        }).catch(err => {
            if (!redirectUnauthenticated) {
                next();
                return;
            }
            if ([
                'token expired',
                'blacklisted token',
                'jwt must be provided',
                'jwt malformed'
            ].includes(err.message)
            ) {
                res.redirect('/login?error')
                return;
            }
            next(err)
        })
    }
}
module.exports = auth; 