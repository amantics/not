import { Body, ConflictException, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./login.dto";
import { UsersService } from "../users/users.service";
import InvalidCredentials from "nestjs-admin/dist/src/adminAuth/exceptions/invalidCredentials.exception";
import { RegisterDto } from "./register.dto";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { Public } from "../decorators/public.decorator";
import { PromoteurLoginDto } from "../promoteurs/dto/promoteurLogin.dto";
import { PromoteursService } from "../promoteurs/promoteurs.service";
import { ConnectWalletDto } from "./connectWallet.dto";
import { Promoteur } from "../promoteurs/promoteur.entity";
import { User } from "../users/user.entity";
import { UserD } from "../decorators/user.decorator";
import { OperationsService } from "../operations/operations.service";
import { generateWalletInfo } from "../config/helpers";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private promoteursService: PromoteursService,
    private operationsService: OperationsService
  ) {}

  @Public()
  @Post("login")
  async login(@Body() loginDto: LoginDto) {
    loginDto.email = loginDto.email.toLowerCase();
    const user = await this.usersService.findOneByEmail(loginDto.email);
    if (!user || !(await user.verifyPassword(loginDto.password))) {
      throw new InvalidCredentials("Invalid credentials");
    }
    return this.authService.login(user);
  }

  @Public()
  @Post("register")
  async register(@Body() registerDto: RegisterDto) {
    registerDto.email = registerDto.email.toLowerCase();
    const user = await this.usersService.findOneByEmail(registerDto.email);
    if (user) {
      throw new ConflictException("username already exists");
    }
    const walletInfo = generateWalletInfo();
    // todo get wallet info from client and save it
    const newUser = await this.usersService.create({
      ...registerDto,
      walletAddress: walletInfo.walletAddress,
    });
    return this.authService.login(newUser);
  }

  @Post("login-promoteur")
  @Public()
  async loginPromoteur(@Body() loginDto: PromoteurLoginDto) {
    loginDto.CIN = loginDto.CIN.toLowerCase();
    const promoteur = await this.promoteursService.findByCIN(loginDto.CIN);
    if (!promoteur || !(await promoteur.verifyPassword(loginDto.password))) {
      throw new InvalidCredentials("Invalid credentials");
    }
    return this.promoteursService.login(promoteur);
  }

  @Post("connect-wallet")
  @ApiOkResponse({ description: "Wallet address saved" })
  async connectWallet(
    @Body() connectWalletDto: ConnectWalletDto,
    @UserD() user: User | Promoteur
  ) {
    const userByAddress = await this.usersService.findOneByAddress(
      connectWalletDto.walletAddress
    );
    const walletAddressError =
      "Adresse du wallet déjà associée à un autre compte.";
    if (userByAddress && userByAddress.id !== user.id) {
      throw new ConflictException(walletAddressError);
    }
    const promoteurByAddress = await this.promoteursService.findOneByAddress(
      connectWalletDto.walletAddress
    );
    if (promoteurByAddress && promoteurByAddress.id !== user.id) {
      throw new ConflictException(walletAddressError);
    }
    const oldWalletAddress = user.walletAddress;
    user.walletAddress = connectWalletDto.walletAddress;
    if (user.hasTempAddress) {
      await this.operationsService.replaceBalanceAddress(
        oldWalletAddress,
        user.walletAddress
      );
    }
    user.hasTempAddress = false;
    if (user instanceof Promoteur) {
      return this.promoteursService.parsePromoteur(
        await this.promoteursService.update(user)
      );
    }
    return this.usersService.parseUser(await this.usersService.update(user));
  }
}
