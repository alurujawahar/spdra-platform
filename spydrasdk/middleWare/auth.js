var jwt = require('jsonwebtoken');
const config = require('../config/cred');
const logger = require('../logger')(module)

const jwtAuth = async (req, res, next) => {
    try {

        if (req && req.cookies && req.cookies.jwt) //||req && req.headers && req.headers.authorization)
        {
            const token = req.cookies.jwt //|| req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, config.JWT_SECRET);
            if (!token) {
                logger.error({ userInfo: req.jwtInfo, method: 'jwtAuth', message: 'No token found in request' })
                throw new Error('No Token assigned! Please relogin! ')
            }
            req.jwtInfo = decoded
        } else {
            logger.error({ userInfo: req.jwtInfo, method: 'jwtAuth', message: 'No token found in request' })
            throw new Error('Session expired! Login again!')
        }
        logger.info({ userInfo: req.jwtInfo }, 'jwtAuth', 'JWT Verified successfully!!!!')
        next();
    } catch (err) {
        logger.error({ userInfo: req.jwtInfo, method: 'jwtAuth', message: err.message })
        return res.status(401).send({
            success: false,
            message: err.message
        });
    }
}

module.exports = {
    jwtAuth
}