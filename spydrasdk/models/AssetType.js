const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

/**
 * 
 * 
 */
var assetType = new Schema({
    assetTypeId: {
        type: Number
    },
    appChannelId: {
        type: Number, required: false
    },
    ownerOrgId: {
        type: String, required: true
    },
    docType: {
        type: String, required: false
    },
    assetType: {
        type: String, required: true, unique: true
    },
    idAttribute: {
        type: String, required: true
    },
    enforceIntigrity: {
        type: Boolean, required: false
    },
    references: [
        mongoose.Schema.Types.Mixed],
    isActive: {
        type: Boolean, default: true
    },
    status: {
        type: String, required: false
    },
    createdBy: {
        type: Object, required: false
    },
    createdAt: {
        type: Date, required: false, default: Date.now
    },
    updatedBy: {
        type: Object, required: false
    },
    updatedAt: {
        type: Date, required: false, default: Date.now
    }
});

assetType.plugin(AutoIncrement, { inc_field: 'assetTypeId' });
const AssetTypeList = mongoose.model('AssetType', assetType);

module.exports = AssetTypeList;