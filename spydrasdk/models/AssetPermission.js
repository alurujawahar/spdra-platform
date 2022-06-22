const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

/**
 * 
 * 
 */
var assetPermission = new Schema({
    assetPermissionId: { type: Number, required: false },
    assetType: { type: String, required: true },
    forOrgId: { type: String, required: true },
    ownerOrgId: { type: Number, required: true },
    role: [ mongoose.Schema.Types.String
    ],
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
        type: String, required: false, default: Date.now
    },
    updatedBy: {
        type: Object, required: false
    },
    updatedAt: {
        type: String, required: false, default: Date.now
    }
});

assetPermission.plugin(AutoIncrement, { inc_field: 'assetPermissionId' });
const AssetPermissionList = mongoose.model('AssetPermission', assetPermission);

module.exports = AssetPermissionList;