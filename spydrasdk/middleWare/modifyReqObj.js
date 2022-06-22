const { nanoid } = require('nanoid');
const logger = require('../logger')(module)
const { DOCTYPE } = require('../utils/Constants');


const assignDocType = async (req, res, next) => {

    try {

        logger.info({ userInfo: req.jwtInfo, method: 'assignDocType' })

        let callingURL = req.originalUrl;

        switch (callingURL) {
            case '/sdk/api/v2/asset':
                req.DocType = DOCTYPE.Asset
                break;
            case '/sdk/api/v2/event':
                req.DocType = DOCTYPE.Event
                break;
            default:
                req.DocType = DOCTYPE.Asset
                break;
        }

        logger.info({ userInfo: req.jwtInfo, method: 'assignDocType', message: req.DocType })

        next()
    } catch (error) {
        logger.error({ userInfo: req.jwtInfo, method: 'assignDocType' })
        return res.status(500).send({
            success: false,
            message: error
        });
    }
}

module.exports = {
    assignDocType
}