Installing latest node version 12 as supported by fabric

<!-- For
 package: 'fabric-ca-client@2.2.5',
 required: { node: '^10.15.3 || ^12.13.1 || ^14.13.1', npm: '^6.4.1' },
 package: 'fabric-common@2.2.5',
 required: { node: '^10.15.3 || ^12.13.1 || ^14.13.1', npm: '^6.4.1' },
 package: 'fabric-network@2.2.5',
 required: { node: '^10.15.3 || ^12.13.1 || ^14.13.1', npm: '^6.4.1' },
 package: 'fabric-protos@2.2.5',
 required: { node: '^10.15.3 || ^12.13.1 || ^14.13.1', npm: '^6.4.1' },
 -->


sudo apt update
sudo apt -y upgrade



sudo apt update
sudo apt -y install curl dirmngr apt-transport-https lsb-release ca-certificates
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -


sudo apt -y install nodejs

sudo apt -y  install gcc g++ make


node -v
npm -v

# SpySDK
Git Rebase Procedure

git checkout master
git pull origin master

git checkout RB
git rebase master

(above tow lines are equavalent to  git rebase master RB


git push --force origin RB)


TBD

While saving reference check if the assetType give is already defined or no?  Without existing asset reference should not be saved.

Once document is created then it should not be changed only update need to be done.  For that update API to be called and assetType, docType and ID should be matched.


Validation of reference check in the event is not working.
