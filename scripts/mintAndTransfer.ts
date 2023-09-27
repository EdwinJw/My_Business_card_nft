import { ethers } from "ethers";
import { MyBusinessCardNFTFactory } from "../typechain-types";
import { readFileSync } from "fs";
import { join } from "path";
const hre = require("hardhat");

// ABI 파일의 경로를 지정합니다.
const abiPath = join(
  __dirname,
  "../artifacts/contracts/MyBusinessCardNFTFactory.sol/MyBusinessCardNFTFactory.json"
);

// 파일을 읽어서 JSON으로 파싱합니다.
const abiJson = JSON.parse(readFileSync(abiPath, "utf8"));

// ABI 정보만 추출합니다.
const abi = abiJson.abi;

const contractAddress = "0x89Bd2E2a3B31DB56C4dc4d01D39313aeC0014F56";

async function main() {
  // Initialize provider and signer
  const provider = hre.ethers.provider; // Hardhat's built-in provider
  const privateKey = process.env.METAMASK_PRIVATE_KEY;

  if (!privateKey) {
    console.error("Please set the METAMASK_PRIVATE_KEY environment variable");
    process.exit(1);
  }

  const wallet = new hre.ethers.Wallet(privateKey, provider); // 연결된 프로바이더 추가
  const currentGasPrice = await provider.getGasPrice();

  const contract = new ethers.Contract(contractAddress, abi, provider).connect(
    wallet
  ) as MyBusinessCardNFTFactory;

  await contract.registerBusinessCardInfo(
    "Edwin",
    "edwinK936@gmail.com",
    "AES digital asset",
    "chicken",
    "dark-knight",
    "soccer",
    "yesterday",
    "cappucino",
    "watch-youtube",
    "Information-security"
  );
  console.log("Business Card Info Registered");

  // Mint a new SimpleCardNFT
  await contract.mintBusinessCardNFT({
    gasPrice: currentGasPrice.add(ethers.utils.parseUnits("1", "gwei")),
    value: ethers.utils.parseEther("0.01"),
  });
  console.log("New BusinessCardNFT Minted");

  // Transfer the SimpleCardNFT to another address
  const recipientAddress = "0x131918c6E5338CDa25E506F4a74a7fFA4F64249B"; //여기서는 제 또 다른 개발용 메타마스크 주소를 넣었습니다. 명함을 주고싶은 사람 주소를 넣으면 됩니당.
  await contract.transferBusinessCardNFT(recipientAddress);
  console.log(`BusinessCardNFT Transferred to ${recipientAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

//정상적으로 sepolia network에 배포가 되었다면 아래와 같이 출력됨.
// Business Card Info Registered
// New BusinessCardNFT Minted
// BusinessCardNFT Transferred to 0x131918c6E5338CDa25E506F4a74a7fFA4F64249B
