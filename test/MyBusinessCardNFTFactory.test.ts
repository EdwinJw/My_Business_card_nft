import { ethers } from "hardhat";
import chai from "chai";
const { expect } = chai;
import { MyBusinessCardNFTFactory } from "../typechain-types";
import { Signer } from "ethers";

describe("MyBusinessCardNFTFactory", () => {
  let myBusinessCardNFTFactory: MyBusinessCardNFTFactory;
  let owner: Signer;
  let addr1: Signer;
  let addr2: Signer;

  beforeEach(async () => {
    const MyBusinessCardNFTFactory = await ethers.getContractFactory(
      "MyBusinessCardNFTFactory"
    );
    myBusinessCardNFTFactory =
      (await MyBusinessCardNFTFactory.deploy()) as MyBusinessCardNFTFactory;
    [owner, addr1, addr2] = await ethers.getSigners();
  });

  describe("Register Business Card Info", () => {
    it("Should register Business Card info", async () => {
      await myBusinessCardNFTFactory
        .connect(addr1)
        .registerBusinessCardInfo(
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
      const BusinessCardInfo = await myBusinessCardNFTFactory.getBusinessCardInfo(
        await addr1.getAddress()
      );
      expect(BusinessCardInfo.name).to.equal("Edwin");
    });
  });

  describe("Minting and Transferring", () => {
    it("Should mint a new BusinessCardNFT", async () => {
      await myBusinessCardNFTFactory
        .connect(addr1)
        .registerBusinessCardInfo(
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
      await myBusinessCardNFTFactory.connect(addr1).mintBusinessCardNFT();
      expect(
        await myBusinessCardNFTFactory.balanceOf(await addr1.getAddress())
      ).to.equal(1);
    });

    it("Should transfer a new BusinessCardNFT", async () => {
      await myBusinessCardNFTFactory
        .connect(addr1)
        .registerBusinessCardInfo(
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
      await myBusinessCardNFTFactory
        .connect(addr1)
        .mintBusinessCardNFT({ value: ethers.utils.parseEther("0.01") });
      await myBusinessCardNFTFactory
        .connect(addr1)
        .transferBusinessCardNFT(await addr2.getAddress());

      expect(
        await myBusinessCardNFTFactory.balanceOf(await addr2.getAddress())
      ).to.equal(1);

      expect(
        await myBusinessCardNFTFactory.getAmountOfTokenOwnedByIssuer(
          await addr1.getAddress()
        )
      ).to.equal(0);
      expect(
        await myBusinessCardNFTFactory.balanceOf(await addr1.getAddress())
      ).to.equal(0);
    });
  });
});
