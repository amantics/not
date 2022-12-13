import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { faker } from "@faker-js/faker";
import { Operations } from "../typechain-types";
import { Operation } from "../entities/operation.entity";
import { CreditStatus } from "../../../../apps/server/src/enums/creditStatus.enum";
import { BigNumber } from "ethers";

function createOperation() {
  return new Operation({
    sellers: faker.random.words(5).split(" "),
    buyers: faker.random.words(5).split(" "),
    amount: parseInt(faker.random.numeric(5), 10),
    sellingFile: "file hash in IPFS",
  });
}

function parseOperation([op, id]: [string, BigNumber]) {
  const opData = JSON.parse(op);
  const oper = new Operation({ ...opData, id: id.toNumber() });
  oper.date = new Date(opData.date);
  return oper;
}
describe("Operations contract", () => {
  let operation: Operations, notaire: SignerWithAddress;

  beforeEach(async () => {
    [notaire] = await ethers.getSigners();
    const Operations = await ethers.getContractFactory("Operations");
    operation = await Operations.deploy();
  });

  describe("Deployment", () => {
    it("should set the right owner", async () => {
      expect(await operation.owner()).to.equal(notaire.address);
    });
  });

  describe("Transactions", function () {
    it("should add operations and increment counter", async () => {
      const data1 = createOperation();
      const data2 = createOperation();
      await operation.createOperation(data1.reference, JSON.stringify(data1));
      await operation.createOperation(data2.reference, JSON.stringify(data2));
      expect((await operation.nextOperationId()).toNumber()).to.equal(2);
      expect((await operation.getOperationsCount()).toNumber()).to.equal(2);
      expect(await operation.getOperations()).to.be.length(2);
    });
    //   get operation
    it("should get operation data by id", async () => {
      const data = createOperation();
      data.id = (await operation.nextOperationId()).toNumber() + 1;
      await operation.createOperation(data.reference, JSON.stringify(data));
      const op = parseOperation(await operation.getOperationById(1));
      expect(op).to.deep.equal(data);
    });

    it("should get operation data by reference", async () => {
      const data = createOperation();
      data.id = (await operation.nextOperationId()).toNumber() + 1;
      await operation.createOperation(data.reference, JSON.stringify(data));
      const op = parseOperation(
        await operation.getOperationByReference(data.reference)
      );
      expect(op).to.deep.equal(data);
    });

    it("should update operation", async () => {
      const data = createOperation();
      data.id = (await operation.nextOperationId()).toNumber() + 1;
      await operation.createOperation(data.reference, JSON.stringify(data));
      data.creditStatus = CreditStatus.GRANTED;
      await operation.updateById(data.id, JSON.stringify(data));
      const op = parseOperation(await operation.getOperationById(data.id));
      expect(op.creditStatus).to.equal(CreditStatus.GRANTED);
    });
    it("should revert if  operation does not exist", async () => {
      await expect(operation.getOperationById(999)).to.be.revertedWith(
        "Operation does not exist"
      );
    });
    //   delete operation
    it("should delete operation", async () => {
      const data = createOperation();
      data.id = (await operation.nextOperationId()).toNumber() + 1;
      await operation.createOperation(data.reference, JSON.stringify(data));
      await operation.deleteById(data.id);
      await expect(operation.getOperationById(data.id)).to.be.revertedWith(
        "Operation does not exist"
      );
    });
  });
});
