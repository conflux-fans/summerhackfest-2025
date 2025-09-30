// import axios from 'axios';

const axios = require('axios')

const ethers = require("ethers")


const apiKey = "207e0c12.0ca654f5c03a4be18a3185ea63c31f81"
async function test(){


const response1 = await axios.get("https://api.lighthouse.storage/api/lighthouse/get_proof?network=testnet&cid=QmaonqdBWeH3DKbJAgjjGLGksXjwJJyENPpBWR9BN7VvPi")


// console.log("THeres is",response1.data.pieceCID,response1.data.carFileSize);
console.log("THeres is",response1);


console.log("Deal ID: " + response1.data.dealInfo[0].dealId);
const carszie = response1.data.carFileSize;

console.log(carszie)

// const proof = await axios.get("https://api.lighthouse.storage/api/lighthouse/get_proof?cid=QmRYsm6rVRDFenqjMHUoRFqhTqHUo2fbQgWkChdD5ibj2t")

// console.log(proof);


// alert("The deal status is");
// const cid = "QmRYsm6rVRDFenqjMHUoRFqhTqHUo2fbQgWkChdD5ibj2t";
// const status = await axios.get("https://calibration.lighthouse.storage/api/deal_status?cid=QmRYsm6rVRDFenqjMHUoRFqhTqHUo2fbQgWkChdD5ibj2t")
// // console.log("Deal ID: " + Number(status.data.currentActiveDeals[0][0].hex))
// const dealStatus = await axios.get(`https://calibration.lighthouse.storage/api/deal_status?cid=${cid}`)

// console.log(dealStatus.)
// console.log("The deal status is ",status.data);

}

// import axios from "axios";

// async function getPoDSI(cid) {
//     const response = await axios.get(`https://api.lighthouse.storage/api/lighthouse/get_proof?cid=${cid}`);
//     console.log('PoDSI:', response.data);
// }

// const cid = 'QmRYsm6rVRDFenqjMHUoRFqhTqHUo2fbQgWkChdD5ibj2t';  // Replace with the actual CID of your file
// // getPoDSI(cid).catch(console.error);




async function verifyDocument() {
    const response1 = await axios.get("https://api.lighthouse.storage/api/lighthouse/get_proof?network=testnet&cid=QmRYsm6rVRDFenqjMHUoRFqhTqHUo2fbQgWkChdD5ibj2t")
    // const { pieceCID, dealInfo } = poDSI;

  

    const dealInfo = response1.data.dealInfo;
    const pieceCID= response1.data.pieceCID;
    

    if (!pieceCID || !dealInfo || dealInfo.length === 0 || !dealInfo.every(deal => deal.dealId && deal.storageProvider)) {
        console.error('Verification Failed');

        alert("Please Wait!,minter is still veryfying the CID");
        return false;
    }

    console.log('Document Verified:', pieceCID);
    return true;
}
// verifyDocument();

// getPoDSI(cid).then(verifyDocument).catch(console.error);

test();

