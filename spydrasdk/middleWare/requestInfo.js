const { nanoid } = require('nanoid');

const requestInfo = async (req, res, next) => {
    req.jwtInfo = { requestId: nanoid() }
    next()
}

module.exports = {
    requestInfo
}