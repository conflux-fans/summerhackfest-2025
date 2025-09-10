Step 1:

set .env with PRIVATE_KEY

Step 2:

npm install

Step 3 (deploy contracts):

npx hardhat run scripts/deployDynamicConfluxAdapter.ts --network conflux
npx hardhat run scripts/deployDynamicWrappedONFT.ts --network base

Step 4:

Update contract addresses in: 
"deployments/base/DynamicWrappedONFT.json"
"deployments/conflux/DynamicConfluxONFTAdapter.json"

Step 5:

npx hardhat lz:oapp:wire --oapp-config layerzero.config.ts 

This part is tricky, txs will fail retry exit.. and rerun

npx hardhat lz:oapp:wire --oapp-config layerzero.config.ts 

usually 4-5 times till it says 

info:    ✓ Your OApp is now configured