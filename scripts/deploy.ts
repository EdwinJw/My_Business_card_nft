require("dotenv").config();
import { ethers } from "hardhat";
import { MyBusinessCardNFTFactory } from "../typechain-types";

async function main() {
  const MyBusinessCardNFTFactory = await ethers.getContractFactory(
    "MyBusinessCardNFTFactory"
  );
  const myBusinessCardNFTFactory: MyBusinessCardNFTFactory =
    (await MyBusinessCardNFTFactory.deploy()) as MyBusinessCardNFTFactory;

  console.log(
    "MyBusinessCardNFTFactory deployed to:",
    await myBusinessCardNFTFactory.address
  );
}

main()
  .then(() => (process.exitCode = 0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });

// 정상적으로 sepolia network에 배포가 되었다면 아래와 같이 출력됨. 배포 주소는 다 다른 것이 정상.
// MyBusinessCardNFTFactory deployed to: 0x806E846858E752eb9f709e9EB3803b9217fbe4d0
