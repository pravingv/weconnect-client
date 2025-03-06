// eslint-disable-next-line import/prefer-default-export
export const alphabetizePeoplesObject = (obj) => {
  const arrayOfObjects = Object.keys(obj).map((key) => ({ ...obj[key], id: key }));
  arrayOfObjects.sort((a, b) => (a.lastName + a.firstName).localeCompare(b.lastName + b.firstName));
  return arrayOfObjects;
};

