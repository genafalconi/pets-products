import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LockDto } from 'src/dto/lock.dto';
import { Lock } from '../schemas/lock.schema';

@Injectable()
export class SubproductsService {
  constructor(
    @InjectModel(Lock.name)
    private readonly lockModel: Model<Lock>,
  ) { }

  async lockSubprods(lockData: LockDto): Promise<Lock[]> {
    const locksSaved: Array<Lock> = [];
    const locksExists: Array<Lock> = [];

    await Promise.all(
      lockData.subproducts.map(async (subprod) => {
        const existingLock = await this.lockModel
          .findOne({
            user: new Types.ObjectId(lockData.user),
            subproduct: new Types.ObjectId(subprod.subprod),
          })
          .exec();

        if (!existingLock) {
          const lockToSave = new this.lockModel({
            _id: new Types.ObjectId(),
            user: lockData.user,
            subproduct: new Types.ObjectId(subprod.subprod),
            quantity: subprod.quantity,
          });

          const lockSaved: Lock = await lockToSave.save();
          locksSaved.push(lockSaved);
        } else {
          locksExists.push(existingLock);
        }
      })
    );

    setTimeout(async () => {
      if (locksSaved.length > 0) {
        for (const lock of locksSaved) {
          await this.lockModel.findByIdAndDelete(lock._id);
          Logger.log(lock, 'Lock deleted by time exceeded');
        }
      }
    }, 600000); // 10 minutes

    Logger.log('Locks saved', locksSaved);

    return locksSaved.length === 0 ? locksExists : locksSaved;
  }


  async removeLockUser(user: string): Promise<Lock[]> {
    const locksDeleted = await this.lockModel.find({ user }).exec();
    await this.lockModel.deleteMany({ user }).exec();

    Logger.log(locksDeleted, 'Deleted locks');
    return locksDeleted;
  }
}
