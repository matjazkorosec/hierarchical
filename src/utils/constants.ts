import data1 from '../data/data-9.json';
import data2 from '../data/data-47.json';
import data3 from '../data/data-10k.json';

export const dataFiles = {
  'data-9.json': data1,
  'data-47.json': data2,
  'data-10k.json': data3,
};

export type DataFileKey = keyof typeof dataFiles;
