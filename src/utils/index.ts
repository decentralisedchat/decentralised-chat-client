type SortOrder = 'asc' | 'desc';

export const sortArrayByKey = <T>(array: T[], key: keyof T, order: SortOrder = 'asc'): T[] => {
  return array.sort((a, b) => {
    const valueA = a[key] as unknown as number;
    const valueB = b[key] as unknown as number;

    if (order === 'asc') {
      return valueA - valueB;
    } else {
      return valueB - valueA;
    }
  });
};