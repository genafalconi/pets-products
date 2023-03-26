import { Injectable, Logger } from '@nestjs/common';
import {
  CollectionReference,
  DocumentData,
  QuerySnapshot,
} from 'firebase-admin/firestore';
import { firebaseFirestore } from '../firebase/firebase.app';
import { LockSubprodDto, LockToSave } from 'src/dto/lockSubprod.dto';

@Injectable()
export class SubproductsService {
  private locksCollection: CollectionReference;

  constructor() {
    this.locksCollection = firebaseFirestore.collection('lock');
  }

  async lockSubprods(lock: LockSubprodDto): Promise<any> {
    const lockDoc = await this.locksCollection
      .where('user', '==', lock.user)
      .get();
    const locksSaved: Array<DocumentData> = [];

    const lockPromises = lock.subprods.map(async (subprod) => {
      const existingLock = lockDoc.docs.find((elem) => {
        return elem.data().idSubprod === subprod.idSubprod;
      });
      if (!existingLock) {
        const lockUser = this.locksCollection.doc();
        const lockToSave: LockToSave = {
          user: lock.user,
          idSubprod: subprod.idSubprod,
          quantity: subprod.quantity,
        };
        await lockUser.set(Object.assign({}, lockToSave));

        const lockSaved = await lockUser.get();
        const lockData = lockSaved.data();
        locksSaved.push({ ...lockData, id: lockSaved.id });
      }
    });

    await Promise.all(lockPromises);

    setTimeout(async () => {
      if (locksSaved) {
        for (let lock of locksSaved) {
          const lockDoc = await this.locksCollection.doc(lock.id).get();
          if (lockDoc) {
            const lockRef = this.locksCollection.doc(lock.id);
            await lockRef.delete(lockDoc.data());
            Logger.log(lockDoc.data(), 'Lock deleted by time exceded');
          }
        }
      }
    }, 6000)

    Logger.log(locksSaved, 'Locks saved');
    return locksSaved;
  }

  async removeLockUser(user: string) {
    const lockDoc = await this.locksCollection.where('user', '==', user).get();
    const lockDeleted: Array<DocumentData> = [];

    if (!lockDoc.empty) {
      lockDoc.docs.map(async (subprod) => {
        const lockId = subprod.id;
        const lockData = subprod.data();
        const lockRef = this.locksCollection.doc(lockId);

        lockDeleted.push(lockData);
        await lockRef.delete(lockData);
      });

      Logger.log(lockDeleted, 'Deleted locks');
      return lockDeleted;
    }
  }
}
