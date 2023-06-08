import {
  Body,
  Controller,
  Delete,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { LockDto } from 'src/dto/lock.dto';
import { FirebaseAuthGuard } from 'src/firebase/firebase.auth.guard';
import { SubproductsService } from './subproducts.service';
import { Lock } from 'src/schemas/lock.schema';

@UseGuards(FirebaseAuthGuard)
@Controller('subproducts')
export class SubproductsController {
  constructor(
    @Inject(SubproductsService)
    private readonly subproductsService: SubproductsService,
  ) {}

  @Post('/lock')
  async lockSubprods(@Body() dataLockSubprods: LockDto): Promise<Lock[]> {
    return await this.subproductsService.lockSubprods(dataLockSubprods);
  }

  @Delete('/lock/:idUser')
  async deleteLockSubprods(@Param('idUser') user: string): Promise<Lock[]> {
    return await this.subproductsService.removeLockUser(user);
  }
}
