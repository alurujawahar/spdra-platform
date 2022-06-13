package asset

import (
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
	"spydra.com/assetManagement/event"
)

type Asset struct {
	ID         string      `json:"assetId"`
	Type       string      `json:"assetType"`
	DocType    string      `json:"docType,omitempty" metadata:"optional"`
	OwnerOrg   string      `json:"ownerOrgId"`
	IsActive   bool        `json:"isActive"`
	Data       interface{} `json:"data"`
	References []Reference `json:"references,omitempty" metadata:"optional"`
	CreatedAt  string      `json:"createdAt"`
	UpdatedAt  string      `json:"updatedAt"`
	CreatedBy  User        `json:"createdBy"`
	UpdatedBy  User        `json:"updatedBy"`
	Attributes interface{} `json:"attributes,omitempty" metadata:"optional"`
}

type Reference struct {
	IdAttribute      string `json:"idAttribute"`
	AssetType        string `json:"assetType"`
	EnforceIntegrity bool   `json:"enforceIntegrity"`
}

func (asset *Asset) CreateAsset(ctx contractapi.TransactionContextInterface) (event event.Event, err error) {
	stub := ctx.GetStub()

	if asset.ID == "" {
		err = fmt.Errorf("invalid asset ID")
		return
	}
	if asset.Type == "" {
		err = fmt.Errorf("invalid asset type")
		return
	}

	assetDefinition := AssetDefinition{Type: asset.Type}
	err = assetDefinition.ReadAssetDefinition(ctx)
	if err != nil {
		return
	}

	err = asset.ReadAsset(ctx)
	if err == nil {
		err = fmt.Errorf("asset already exists")
		return
	}

	key, err := stub.CreateCompositeKey("asset", []string{asset.ID, asset.Type})
	if err != nil {
		return
	}

	value, err := json.Marshal(asset)
	if err != nil {
		return
	}

	err = stub.PutState(key, value)
	if err != nil {
		return
	}

	event.Type = "Asset"
	event.Message = fmt.Sprintf("Created: %s of type %s", asset.ID, asset.Type)

	return
}

func (asset *Asset) ReadAsset(ctx contractapi.TransactionContextInterface) (err error) {
	stub := ctx.GetStub()

	if asset.ID == "" {
		err = fmt.Errorf("invalid asset ID")
		return
	}
	if asset.Type == "" {
		err = fmt.Errorf("invalid asset type")
		return
	}

	key, err := stub.CreateCompositeKey("asset", []string{asset.ID, asset.Type})
	if err != nil {
		return
	}

	value, err := stub.GetState(key)
	if err != nil {
		return
	}

	err = json.Unmarshal(value, asset)
	if err != nil {
		return
	}

	if asset.ID == "" {
		err = fmt.Errorf("invalid asset ")
		return
	}

	return
}

func (asset *Asset) UpdateAsset(ctx contractapi.TransactionContextInterface) (event event.Event, err error) {
	stub := ctx.GetStub()

	oldAsset := Asset{ID: asset.ID, Type: asset.Type}

	err = oldAsset.ReadAsset(ctx)
	if err != nil {
		return
	}

	key, err := stub.CreateCompositeKey("asset", []string{asset.ID, asset.Type})
	if err != nil {
		return
	}

	value, err := json.Marshal(asset)
	if err != nil {
		return
	}

	err = stub.PutState(key, value)
	if err != nil {
		return
	}

	event.Type = "Asset"
	event.Message = fmt.Sprintf("Updated: %s of type %s", asset.ID, asset.Type)

	return
}
