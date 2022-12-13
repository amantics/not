import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Operation } from "./operation.entity";
import { Repository } from "typeorm";
import { EthersService } from "../ethers/ethers.service";
import { Operations } from "@newer/hardhat";
import { User } from "../users/user.entity";
import { BigNumber } from "ethers";
import { TokenTransfer } from "./TokenTransfer";

function parseReversed(
  operations: string[],
  ids: BigNumber[],
  order: "DESC" | "ASC"
) {
  const operationsArray = [];
  for (
    let i = order === "DESC" ? operations.length - 1 : 0;
    order === "DESC" ? i >= 0 : i < operations.length;
    i += order === "DESC" ? -1 : 1
  ) {
    if (!operations[i].trim()) continue;
    operationsArray.push(
      new Operation({ ...JSON.parse(operations[i]), id: ids[i].toNumber() })
    );
  }
  return operationsArray;
}

const gasLimit = 10000000;

@Injectable()
export class OperationsService {
  private operationsContract: Operations;

  constructor(
    @InjectRepository(Operation)
    private operationsRepository: Repository<Operation>,
    private ethersService: EthersService
  ) {
    this.operationsContract = this.ethersService.getContract("operations");
  }

  /**
   * connect user wallet to outgoing transaction
   * @param user
   */
  public connect(user: User) {
    this.operationsContract = this.operationsContract.connect(
      this.ethersService.getSigner(user.privateKey)
    );
    return this;
  }

  async findAllByOwnerId(ownerId: number, order: "DESC" | "ASC" = "DESC") {
    const [operations, ids] =
      await this.operationsContract.getOperationsForOwnerId(ownerId);
    return parseReversed(operations, ids, order);
  }

  async findAllByReferences(
    references: string[],
    order: "DESC" | "ASC" = "DESC"
  ) {
    const [operations, ids] =
      await this.operationsContract.getOperationsByReferences(references);
    return parseReversed(operations, ids, order);
  }

  async findAll(order: "DESC" | "ASC" = "DESC") {
    const [operations, ids] = await this.operationsContract.getOperations();

    return parseReversed(operations, ids, order);
  }

  async findById(id: number) {
    try {
      const [payload, payloadId] =
        await this.operationsContract.getOperationById(id);
      return new Operation({
        ...JSON.parse(payload),
        id: payloadId.toNumber(),
      });
    } catch (e) {
      if (e.reason === "Operation does not exist") {
        return null;
      } else {
        console.log(e);
      }
    }
  }

  async findByIdOrFail(id: number): Promise<Operation> {
    const operation = await this.findById(id);
    if (!operation) {
      throw new NotFoundException(`Operation with id ${id} not found`);
    }
    return operation;
  }

  async findByReferenceOrFail(reference: string) {
    const operation = await this.findOneByReference(reference);
    if (!operation) {
      throw new NotFoundException(
        `Operation with reference ${reference} not found`
      );
    }
    return operation;
  }

  async findOneByReference(reference: string) {
    try {
      const [payload, payloadId] =
        await this.operationsContract.getOperationByReference(reference);
      return new Operation({
        ...JSON.parse(payload),
        id: payloadId.toNumber(),
      });
    } catch (e) {
      if (e.reason === "Operation does not exist") {
        throw new NotFoundException(
          `Operation with reference ${reference} not found`
        );
      } else {
        console.log(e);
      }
    }
  }

  async findAllByOwnerAddress(
    ownerAddress: string,
    order: "DESC" | "ASC" = "DESC"
  ) {
    const [operations, ids] =
      await this.operationsContract.getOperationsForOwner(ownerAddress);
    return parseReversed(operations, ids, order);
  }

  async create(operation: Partial<Operation>, owner: User) {
    const notification = operation.generateNotification();
    await this.operationsContract.createOperation(
      operation.reference,
      JSON.stringify(operation),
      owner.id,
      notification.primaryKeys,
      notification.payload,
      {
        gasLimit,
      }
    );
    operation.id = (await this.operationsContract.nextOperationId()).toNumber();
  }

  async update(operation, transfer: TokenTransfer = new TokenTransfer()) {
    const id = operation.id;
    if (id === undefined) {
      throw new Error("Operation id is required");
    }
    const notification = operation.generateNotification();
    return this.operationsContract.updateById(
      id,
      JSON.stringify(operation),
      notification.primaryKeys,
      notification.payload,
      transfer.transfer,
      transfer.from || (await this.ethersService.getMainSigner().getAddress()),
      transfer.to,
      transfer.tokens,
      {
        gasLimit,
      }
    );
  }

  async updateByReferenceOrFail(
    reference: string,
    updates: Partial<Operation>,
    beforeUpdate?: (operation: Operation) => Promise<void> | void
  ) {
    const operation = await this.findByReferenceOrFail(reference);
    await beforeUpdate?.(operation);
    operation.update(updates);
    const transfer = { ...operation.transferOperation };
    delete operation.transferOperation;
    await this.update(operation, transfer);
    return operation;
  }

  async count() {
    return (await this.operationsContract.getOperationsCount()).toNumber();
  }

  async replaceBalanceAddress(oldAddress: string, newAddress: string) {
    return this.operationsContract.replaceBalanceAddress(
      oldAddress,
      newAddress,
      {
        gasLimit,
      }
    );
  }
}
