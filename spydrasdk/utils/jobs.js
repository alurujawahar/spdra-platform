const logger = require('../logger')(module);

const BlockEventController = require('./../src/events/BlockEventController')
const blockEventController = new BlockEventController();   
const startListner = blockEventController.startListner();

module.exports = {
    startListner
}