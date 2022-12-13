import { Global, Module } from "@nestjs/common";
import { EthersService } from "./ethers.service";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [ConfigModule.forRoot()],
  exports: [EthersService],
  controllers: [],
  providers: [EthersService],
})
@Global()
export class EthersModule {}
