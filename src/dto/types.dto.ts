export class CategoryDto {
  ALIMENTO_BALANCEADO = 'ALIMENTO BALANCEADO';
  ACCESORIOS = 'ACCESORIOS';
  PIEDRAS = 'PIEDRAS';
  MEDICAMENTO = 'MEDICAMENTO';
}

export class AnimalDto {
  CAT = 'CAT';
  DOG = 'DOG';
}

export class AnimalSizeDto {
  SMALL = 'SMALL';
  MEDIUM = 'MEDIUM';
  MEDIUM_LARGE = 'MEDIUM AND LARGE';
  LARGE = 'LARGE';
  ALL = 'ALL';
}

export class AnimalAgeDto {
  PUPPY = 'PUPPY';
  ADULT = 'ADULT';
  SENIOR = 'SENIOR';
  ALL = 'ALL';
  KITTEN = 'KITTEN';
}

export class BrandDto {
  ROYAL_CANIN = 'ROYAL CANIN';
  PRO_PLAN = 'PRO PLAN';
  EXCELLENT = 'EXCELLENT';
  EUKANUBA = 'EUKANUBA';
  IAMS = 'IAMS';
  PEDIGREE = 'PEDIGREE';
  VITAL_CAN = 'VITAL CAN';
  CAN_CAT = 'CAN CAT';
  ABSORSOL = 'ABSORSOL';
  OLD_PRINCE = 'OLD PRINCE';
  BIOPET = 'BIOPET';
  UNIK = 'UNIK';
  OPTIMUM = 'OPTIMUM';
}

export class LandingDto {
  image: string
  type: LandingType
  active?: boolean
  id?: string
}

export enum LandingType {
  CAROUSEL = 'CAROUSEL',
  INFO = 'INFO',
  PROMO = 'PROMO'
}