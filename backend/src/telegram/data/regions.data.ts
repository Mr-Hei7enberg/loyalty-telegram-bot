import type { RegionInfo } from '../interfaces/loyalty.interface';

export const REGIONS: RegionInfo[] = [
  {
    id: 'kyivska',
    title: 'Київська область',
    networks: [
      {
        id: 'truck-fuel',
        title: 'Truck Fuel',
        locations: [
          'м. Київ, проспект Перемоги, 35',
          'м. Біла Церква, вул. Леваневського, 62',
        ],
      },
      {
        id: 'dizel-point',
        title: 'Diesel Point',
        locations: [
          'с. Гатне, вул. Київська, 2а',
          'м. Фастів, вул. Соборна, 14',
        ],
      },
    ],
  },
  {
    id: 'lvivska',
    title: 'Львівська область',
    networks: [
      {
        id: 'west-oil',
        title: 'West Oil Group',
        locations: [
          'м. Львів, вул. Городоцька, 235',
          'м. Дрогобич, вул. Стрийська, 4',
          'м. Червоноград, вул. Львівська, 19',
        ],
      },
      {
        id: 'galnafta',
        title: 'Галнафтопродукт',
        locations: [
          'м. Стрий, вул. Болехівська, 13',
          'м. Самбір, вул. Дрогобицька, 81',
        ],
      },
    ],
  },
  {
    id: 'dnipropetrovska',
    title: 'Дніпропетровська область',
    networks: [
      {
        id: 'river-energy',
        title: 'River Energy',
        locations: [
          'м. Дніпро, вул. Запорізьке шосе, 55',
          'м. Кам’янське, просп. Свободи, 27',
        ],
      },
    ],
  },
];
