import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Assessment", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployAssessmentFixture() {
    const ONE_ETH = 1;

    const initBalance = ONE_ETH;

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const Assessment = await ethers.getContractFactory("Assessment");
    const assessment = await Assessment.deploy(initBalance);

    return { assessment, initBalance, owner, otherAccount, ONE_ETH };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { assessment, owner } = await loadFixture(deployAssessmentFixture);

      expect(await assessment.owner()).to.equal(owner.address);
    });

    it("Should receive and store the funds", async function () {
      const { assessment, initBalance } = await loadFixture(
        deployAssessmentFixture
      );

      expect(await assessment.balance()).to.equal(
        initBalance
      );
    });
  });

  describe("Withdrawals", function () {
    describe("Validations", function () {
      it("Should revert with the right error if called from another account", async function () {
        const { assessment, otherAccount, ONE_ETH } = await loadFixture(
          deployAssessmentFixture
        );

        // We use .connect() to send a transaction from another account
        await expect(assessment.connect(otherAccount).withdraw(ONE_ETH)).to.be.revertedWith(
          "You are not the owner of this account"
        );
      });

      it("Shouldn't fail if the owner calls it", async function () {
        const { assessment, ONE_ETH } = await loadFixture(
          deployAssessmentFixture
        );

        await expect(assessment.withdraw(ONE_ETH)).not.to.be.reverted;
      });
    });

    describe("Events", function () {
      it("Should emit an event on withdrawals", async function () {
        const { assessment, ONE_ETH } = await loadFixture(
          deployAssessmentFixture
        );

        await expect(assessment.withdraw(ONE_ETH))
          .to.emit(assessment, "Withdraw")
          .withArgs(ONE_ETH);
      });
    });
  });
});
