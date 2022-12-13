import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UnprocessableEntityException,
  UseInterceptors,
} from "@nestjs/common";
import { CreateOperationDto } from "./dtos/createOperation.dto";
import { OperationsService } from "./operations.service";
import { Operation } from "./operation.entity";
import { UserRole } from "../enums/userRole.enum";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { createNotification } from "../config/helpers";
import { Roles } from "../decorators/roles.decorator";
import { ChangeCreditStatusDto } from "./dtos/changeCreditStatus.dto";
import { AddEngagementNotaryFileDto } from "./dtos/addEngagementNotaryFile.dto";
import { DepositStatus } from "../enums/depositStatus.enum";
import { AcceptDepositDto } from "./dtos/acceptDeposit.dto";
import { AddMinuteFileDto } from "./dtos/addMinuteFile.dto";
import { TaxPaymentStatus } from "../enums/taxPaymentStatus.enum";
import { TaxPaymentDto } from "./dtos/taxPayment.dto";
import { FormalizeGuarantiesDto } from "./dtos/formalizeGuaranties.dto";
import { BeneficiaryPaymentInitiationDto } from "./dtos/beneficiaryPaymentInitiationDto";
import { NotificationsService } from "../notifications/notifications.service";
import { UserD } from "../decorators/user.decorator";
import { User } from "../users/user.entity";
import { PromoteursService } from "../promoteurs/promoteurs.service";
import { Promoteur } from "../promoteurs/promoteur.entity";
import { BeneficiaryPaymentStatus } from "../enums/beneficiaryPaymentStatus.enum";
import { NotificationsMessages } from "../../../../libs/shared/src/lib/notifications";
import { CreditStatus } from "../enums/creditStatus.enum";
import { UsersService } from "../users/users.service";
import { In } from "typeorm";

enum IdentifierType {
  ID = "ID",
  REFERENCE = "REFERENCE",
}

@ApiTags("Operations")
@UseInterceptors(ClassSerializerInterceptor)
@ApiBearerAuth()
@Controller("operations")
@ApiForbiddenResponse({ description: "Forbidden." })
@ApiNotFoundResponse({ description: "Not found." })
export class OperationsController {
  constructor(
    private operationsService: OperationsService,
    private readonly notificationsService: NotificationsService,
    private readonly promoteursService: PromoteursService,
    private readonly usersService: UsersService
  ) {}

  @Get()
  @Roles(...(Object.keys(UserRole) as UserRole[]))
  async findAll(@UserD() user: User | Promoteur) {
    try {
      switch (user.role) {
        case UserRole.NOTAIRE:
          try {
            return await this.operationsService.findAllByOwnerId(user.id);
          } catch (e) {
            if (e.reason === "No operations for this owner") return [];
            console.error(e);
            return [];
          }
        case UserRole.PROMOTEUR:
          return this.operationsService.findAllByReferences(
            (user as Promoteur).references
          );
        default:
          return this.operationsService.findAll();
      }
    } catch (e) {
      return [];
    }
  }

  @Get("/:identifier")
  @ApiQuery({
    name: "type",
    enum: IdentifierType,
    description: "type of identifier",
  })
  async findOne(
    @Param("identifier") identifier: string,
    @Query("type") filterType: IdentifierType
  ) {
    if (filterType === IdentifierType.REFERENCE) {
      return this.operationsService.findOneByReference(identifier);
    }

    const id = parseInt(identifier, 10);
    if (!id)
      throw new UnprocessableEntityException("identifier must be a number");
    return this.operationsService.findByIdOrFail(id);
  }

  @Post()
  @Roles(UserRole.NOTAIRE)
  @ApiCreatedResponse({
    description: "The record has been successfully created.",
    type: Operation,
  })
  async create(
    @Body() createOperationDto: CreateOperationDto,
    @UserD() user: User
  ) {
    const notification = NotificationsMessages.initiated;
    const operation = new Operation({
      ...createOperationDto,
      owner: user.id,
      notification,
    });
    await this.operationsService.create(operation, user);
    await this.promoteursService.attach(operation);
    await createNotification(
      this.notificationsService,
      operation,
      notification
    );

    return operation;
  }

  @Put("/:reference/credit-status")
  @Roles(UserRole.BANQUE)
  @ApiOkResponse({
    description: "Operation credit status changed successfully",
  })
  async changeCreditStatus(
    @Param("reference") reference: string,
    @Body() body: ChangeCreditStatusDto
  ) {
    const notification =
      body.creditStatus === CreditStatus.GRANTED
        ? NotificationsMessages.creditGranted
        : NotificationsMessages.creditRefused;
    const operation = await this.operationsService.updateByReferenceOrFail(
      reference,
      {
        ...body,
        notification,
      }
    );
    await createNotification(
      this.notificationsService,
      operation,
      notification
    );

    return operation;
  }

  @Put("/:reference/engagement-notary")
  @Roles(UserRole.NOTAIRE)
  @ApiOkResponse({
    description: "Operation engagement notary added successfully",
  })
  async addEngagementNotary(
    @Param("reference") reference: string,
    @Body() body: AddEngagementNotaryFileDto,
    @UserD() user: User
  ) {
    const notification = NotificationsMessages.notaryAdded;
    const operation = await this.operationsService.updateByReferenceOrFail(
      reference,
      { ...body, notification },
      (op) => op.ownerGuard(user)
    );

    await createNotification(
      this.notificationsService,
      operation,
      notification
    );

    return operation;
  }

  @Get("/:reference/unblock-funds")
  @Roles(UserRole.BANQUE)
  @ApiOkResponse({ description: "Operation funds unblocked successfully" })
  async unblockFunds(@Param("reference") reference: string) {
    const notification = NotificationsMessages.fundsUnblocked;
    const operation = await this.operationsService.updateByReferenceOrFail(
      reference,
      {
        fundsUnblocked: true,
        notification,
      },
      async (op) => {
        const notaire = await this.usersService.findById(op.owner);
        op.transferOperation = {
          transfer: true,
          tokens: [op.amount],
          to: [notaire.walletAddress],
        };
      }
    );

    await createNotification(
      this.notificationsService,
      operation,
      notification
    );

    return operation;
  }

  @Put("/:reference/sign-deposit")
  @Roles(UserRole.NOTAIRE)
  @ApiOkResponse({ description: "Operation deposit signed successfully" })
  async signDeposit(
    @Param("reference") reference: string,
    @UserD() user: User
  ) {
    const notification = NotificationsMessages.depositSigned;
    const operation = await this.operationsService.updateByReferenceOrFail(
      reference,
      {
        depositStatus: DepositStatus.SIGNED,
        notification,
      },
      async (op) => {
        op.ownerGuard(user);
        const cdg = await this.usersService.findOne({
          where: { role: UserRole.CDG },
        });
        op.transferOperation = {
          transfer: true,
          tokens: [op.amount],
          to: [cdg.walletAddress],
          from: user.walletAddress,
        };
      }
    );
    await createNotification(
      this.notificationsService,
      operation,
      notification
    );

    return operation;
  }

  @Put("/:reference/accept-deposit")
  @Roles(UserRole.CDG)
  @ApiOkResponse({ description: "Operation deposit accepted successfully" })
  async acceptDeposit(
    @Param("reference") reference: string,
    @Body() body: AcceptDepositDto
  ) {
    const notification = NotificationsMessages.depositAccepted;
    const operation = await this.operationsService.updateByReferenceOrFail(
      reference,
      { ...body, depositStatus: DepositStatus.ACCEPTED, notification }
    );
    await createNotification(
      this.notificationsService,
      operation,
      notification
    );

    return operation;
  }

  @Put("/:reference/minute-file")
  @Roles(UserRole.NOTAIRE)
  @ApiOkResponse({ description: "Operation minute file added successfully" })
  async addMinuteFile(
    @Param("reference") reference: string,
    @Body() body: AddMinuteFileDto,
    @UserD() user: User
  ) {
    const notification = NotificationsMessages.minuteFileAdded;
    const operation = await this.operationsService.updateByReferenceOrFail(
      reference,
      { ...body, notification },
      (op) => op.ownerGuard(user)
    );
    await createNotification(
      this.notificationsService,
      operation,
      notification
    );

    return operation;
  }

  @Get("/:reference/initiate-tax-payment")
  @Roles(UserRole.NOTAIRE)
  @ApiOkResponse({
    description: "Operation tax payment initialized successfully",
  })
  async initializeTaxPayment(
    @Param("reference") reference: string,
    @UserD() user: User
  ) {
    const notification = NotificationsMessages.taxPaymentInitiated;
    const operation = await this.operationsService.updateByReferenceOrFail(
      reference,
      {
        taxPaymentStatus: TaxPaymentStatus.INITIALIZED,
        notification,
      },
      (op) => op.ownerGuard(user)
    );
    await createNotification(
      this.notificationsService,
      operation,
      notification
    );

    return operation;
  }

  @Get("/:reference/accept-tax-payment")
  @Roles(UserRole.CDG)
  @ApiOkResponse({ description: "Operation tax payment accepted successfully" })
  async acceptTaxPayment(
    @Param("reference") reference: string,
    @UserD() user: User
  ) {
    const notification = NotificationsMessages.taxPaymentAccepted;
    const operation = await this.operationsService.updateByReferenceOrFail(
      reference,
      {
        taxPaymentStatus: TaxPaymentStatus.ACCEPTED,
        notification,
      },
      async (op) => {
        const dgi = await this.usersService.findOne({
          where: { role: UserRole.DGI },
        });
        const amount = op.amount / 100 + (op.amount * 8) / 100;
        op.transferOperation = {
          transfer: true,
          tokens: [amount],
          to: [dgi.walletAddress],
          from: user.walletAddress,
        };
      }
    );

    await createNotification(
      this.notificationsService,
      operation,
      notification
    );

    return operation;
  }

  @Put("/:reference/pay-tax")
  @Roles(UserRole.DGI)
  @ApiOkResponse({ description: "Operation tax paid successfully" })
  async payTax(
    @Param("reference") reference: string,
    @Body() body: TaxPaymentDto
  ) {
    const notification = NotificationsMessages.taxPaid;
    const operation = await this.operationsService.updateByReferenceOrFail(
      reference,
      {
        ...body,
        taxPaymentStatus: TaxPaymentStatus.PAID,
        notification,
      }
    );
    await createNotification(
      this.notificationsService,
      operation,
      notification
    );

    return operation;
  }

  @Put("/:reference/formalize-guaranties")
  @Roles(UserRole.ANCFCC)
  @ApiOkResponse({ description: "Guaranties formalized successfully" })
  async formalizeGuaranties(
    @Param("reference") reference: string,
    @Body() body: FormalizeGuarantiesDto
  ) {
    const notification = NotificationsMessages.guarantiesFormalized;
    const operation = await this.operationsService.updateByReferenceOrFail(
      reference,
      { ...body, notification }
    );
    await createNotification(
      this.notificationsService,
      operation,
      notification
    );

    return operation;
  }

  @Put("/:reference/pay-beneficiary")
  @Roles(UserRole.CDG)
  @ApiOkResponse({ description: "Beneficiary paid successfully" })
  async payBeneficiary(
    @Param("reference") reference: string,
    @UserD() user: User
  ) {
    const notification = NotificationsMessages.beneficiaryPaid;
    const operation = await this.operationsService.updateByReferenceOrFail(
      reference,
      {
        beneficiaryPaymentStatus: BeneficiaryPaymentStatus.REALIZED,
        notification,
      },
      async (op) => {
        if (!op.sellers.length) return;
        const sellers = await this.promoteursService.findAll({
          where: { CIN: In(op.sellers) },
        });
        const amount = op.amount / 100 + (op.amount * 8) / 100;
        const remainingAfterTax = op.amount - amount;
        const amountPerSeller = remainingAfterTax / sellers.length;
        op.transferOperation = {
          transfer: true,
          tokens: Array(sellers.length).fill(amountPerSeller),
          to: sellers.map((seller) => seller.walletAddress),
          from: user.walletAddress,
        };
      }
    );

    await createNotification(
      this.notificationsService,
      operation,
      notification
    );

    return operation;
  }

  @Put("/:reference/initiate-beneficiary")
  @Roles(UserRole.NOTAIRE)
  @ApiOkResponse({ description: "Beneficiary initiated successfully" })
  async initiateBeneficiaryPayment(
    @Param("reference") reference: string,
    @Body() body: BeneficiaryPaymentInitiationDto
  ) {
    const notification = NotificationsMessages.beneficiaryInitiated;
    const operation = await this.operationsService.updateByReferenceOrFail(
      reference,
      {
        ...body,
        beneficiaryPaymentStatus: BeneficiaryPaymentStatus.INITIATED,
        notification,
      }
    );

    await createNotification(
      this.notificationsService,
      operation,
      notification
    );

    return operation;
  }

  @Put("/:reference/end")
  @Roles(UserRole.NOTAIRE)
  @ApiOkResponse({ description: "Operation has ended successfully." })
  async end(@Param("reference") reference: string, @UserD() user: User) {
    const notification = NotificationsMessages.ended;
    const operation = await this.operationsService.updateByReferenceOrFail(
      reference,
      { ended: true, notification },
      (op) => op.ownerGuard(user)
    );

    await createNotification(
      this.notificationsService,
      operation,
      notification
    );

    return operation;
  }
}
