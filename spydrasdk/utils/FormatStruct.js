
const logger = require('../logger')(module);
const { getIdFieldForType, getForiegnKeysForType } = require('./NetworkUtil');

const formatAssetInput = async (docType, asset, orgId) => {
  let mapping = await getIdFieldForType(asset.assetType)
  logger.info({ method: 'addAsset', message: "mapping.SourceId", payload: mapping.SourceId })

  if (asset.data.hasOwnProperty(mapping.SourceId)) {
    ledgerAsset = asset
    ledgerAsset.assetId = asset.data[mapping.SourceId]
    ledgerAsset.docType = docType
    ledgerAsset.ownerOrgId = orgId
    ledgerAsset.data = asset.data
    ledgerAsset.createdBy = asset.createdBy
    let date = new Date();
    ledgerAsset.createdAt = date
  } else {
    logger.error({ method: 'formatAssetInput - Error', message: 'Asset does not contain property' })
    throw new Error('Asset structure does not contain key - ' + mapping.SourceId)
  }
  return ledgerAsset;
}

const formatReferences = async (asset) => {
  let listofRef = []
  let references = await getForiegnKeysForType(asset.assetType)
  logger.info({ method: 'formatReferences', message: "references", payload: references })
  for (var i in references) {
    if (asset.data.hasOwnProperty(references[i].section)) {
      if (references[i].enforceIntegrity) {
        logger.info({ method: 'formatReferences', message: "Event contain reference property - " + references[i].section })
        for (var j in asset.data[references[i].section]) {
          if (asset.data[references[i].section][j].hasOwnProperty(references[i].foriegnKey)) {
            logger.info({ method: 'formatReferences', message: "Foriegn Kye - " + asset.data[references[i].section][j][references[i].foriegnKey] })
            listofRef.push({ "assetId": asset.data[references[i].section][j][references[i].foriegnKey], "assetType": references[i].assetType })
          } else {
            logger.error({ method: 'formatReferences - Error', message: 'Foriegnkey not found in reference section.' })
            throw new Error(`${references[i].foriegnKey} key not found in ${references[i].section} body.`)
          }
        }
      }
    } else {
      logger.error({ method: 'formatReferences - Error', message: 'Asset does not contain reference section ' + references[i].section })
    }
  }
  return listofRef;
}

module.exports = {
  formatAssetInput,
  formatReferences
}