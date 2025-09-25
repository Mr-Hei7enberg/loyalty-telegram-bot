import type { DiscountGroupSeed } from '../interfaces/loyalty.interface';

export const DISCOUNT_GROUPS: DiscountGroupSeed[] = [
  {
    id: 'beverages',
    title: 'Напої',
    items: [
      'Кава та какао у зернах і капсулах',
      'Охолоджені напої у пляшках 0,5 л',
      'Енергетичні напої преміальної лінійки',
    ],
  },
  {
    id: 'snacks',
    title: 'Снеки',
    items: [
      'Горішки та сухофрукти у порційних наборах',
      "М'ясні снеки та джеркі",
      'Батончики мюслі без цукру',
    ],
  },
  {
    id: 'autochemistry',
    title: 'Автохімія',
    items: [
      'Омивачі скла з зимовою формулою',
      'Поліролі для салону та пластику',
      'Мастила та кондиціонери для гумових ущільнювачів',
    ],
  },
];
