export class LockSubprodDto {
  user: string;
  subprods: Array<SubprodLockDto>;
}

export class SubprodLockDto {
  idSubprod: string;
  quantity: number;
}

export class LockToSave {
  user: string;
  idSubprod: string;
  quantity: number;
}
