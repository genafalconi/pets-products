import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LockDto } from 'src/dto/lock.dto';
import { Lock } from '../schemas/lock.schema';
import { Subproduct } from 'src/schemas/subprod.schema';

@Injectable()
export class SubproductsService {
  constructor(
    @InjectModel(Lock.name)
    private readonly lockModel: Model<Lock>,
    @InjectModel(Subproduct.name)
    private readonly subproductModel: Model<Subproduct>,
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
            user: new Types.ObjectId(lockData.user),
            subproduct: new Types.ObjectId(subprod.subprod),
            quantity: subprod.quantity,
          });

          const [lockSaved] = await Promise.all([
            await lockToSave.save(),
            await this.subproductModel.findByIdAndUpdate(
              new Types.ObjectId(subprod.subprod),
              { has_lock: true },
            ),
          ]);
          locksSaved.push(lockSaved);
        } else {
          locksExists.push(existingLock);
        }
      }),
    );

    setTimeout(async () => {
      if (locksSaved.length > 0) {
        for (const lock of locksSaved) {
          await Promise.all([
            await this.lockModel.findByIdAndDelete(lock._id),
            await this.subproductModel.findByIdAndUpdate(
              new Types.ObjectId(lock.subproduct._id),
              { has_lock: false },
            ),
          ]);
          Logger.log(lock, 'Lock deleted by time exceeded');
        }
      }
    }, 600000); // 10 minutes

    Logger.log('Locks saved', locksSaved);

    return locksSaved.length === 0 ? locksExists : locksSaved;
  }

  async removeLockUser(user: string): Promise<Lock[]> {
    const [locksDeleted] = await Promise.all([
      await this.lockModel.find({ user }).exec(),
      await this.lockModel.deleteMany({ user }).exec(),
    ]);

    for (const lock of locksDeleted) {
      await this.subproductModel.findByIdAndUpdate(lock.subproduct._id, {
        has_lock: false,
      });
    }
    Logger.log(locksDeleted, 'Deleted locks');
    return locksDeleted;
  }

  async getHighlightedSubprods(): Promise<Subproduct[]> {
    return await this.subproductModel
      .find({ highlight: true, active: true })
      .populate({
        path: 'product',
        model: 'Product',
        select: '_id name image description'
      })
      .select('_id buy_price sell_price product size stock sale_price highlight')
  }

}
