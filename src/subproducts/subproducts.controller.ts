import { Body, Controller, Delete, Get, Inject, Param, Post, UseGuards } from '@nestjs/common';
import { DocumentData } from 'firebase-admin/firestore';
import { LockSubprodDto } from 'src/dto/lockSubprod.dto';
import { FirebaseAuthGuard } from 'src/firebase/firebase.auth.guard';
import { SubproductsService } from './subproducts.service';

@UseGuards(FirebaseAuthGuard)
@Controller('subproducts')
export class SubproductsController {

  constructor(
    @Inject(SubproductsService)
    private readonly subproductsService: SubproductsService
  ) { }

  @Post('/lock')
  async lockSubprods(@Body() dataLockSubprods: LockSubprodDto): Promise <DocumentData> {
    return await this.subproductsService.lockSubprods(dataLockSubprods)
  }

  @Delete('/lock/:idUser')
  async deleteLockSubprods(@Param('idUser') user: string): Promise <DocumentData> {
    return await this.subproductsService.removeLockUser(user)
  }

}
