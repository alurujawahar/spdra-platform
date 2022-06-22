

const ASSETS_LIMIT_REACHED = 'Assets creation limit reached. More assest can not be created in trial setup.'
const DOC_TYPE_OUT_OF_RANGE = 'Provided document type is not a valid one.'
const INVALID_FILE_FORMAT = 'Invalid file template. Please check !'

const ID_NOT_FOUND = (key, id) => {
    return `${key} details not found for ID: ${id}`
}

const ID_DOESNOT_EXIST = (id) => {
    return `${id} does not exist`
}

module.exports = {
    ASSETS_LIMIT_REACHED,
    DOC_TYPE_OUT_OF_RANGE,
    INVALID_FILE_FORMAT,
    ID_NOT_FOUND,
    ID_DOESNOT_EXIST
}