export class LockDto {
  user: string;
  subproducts: Array<SubprodLockDto>;
}

export class SubprodLockDto {
  subprod: string;
  quantity: number;
}
