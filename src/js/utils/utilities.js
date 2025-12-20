export const alphabetizePeoplesObject = (incomingObjectList, sortByFirstName = false) => {
  const arrayOfObjects = Object.keys(incomingObjectList).map((key) => ({ ...incomingObjectList[key] })); // Dale removed replacement of id with the key because the key is not the personId
  if (sortByFirstName) {
    arrayOfObjects.sort((a, b) => (a.firstName + a.lastName).localeCompare(b.firstName + b.lastName));
  } else {
    arrayOfObjects.sort((a, b) => (a.lastName + a.firstName).localeCompare(b.lastName + b.firstName));
  }
  return arrayOfObjects;
};

export const filterNamesWithDEPRICATEKey = (incomingObjectList) => {
  let arrayOfObjects = Object.keys(incomingObjectList).map((key) => ({ ...incomingObjectList[key] }));
  arrayOfObjects = arrayOfObjects.filter((person) => {
    const fname = person.firstName?.toUpperCase() || '';
    const lname = person.lastName?.toUpperCase() || '';
    return !fname.includes('DEPRECATE') && !lname.includes('DEPRECATE') && !fname.includes('DELETE') &&
      !lname.includes('DELETE');
  });

  return arrayOfObjects;
};

export const orderListByFurthestFutureStartDate = (incomingObjectList) => {
  const arrayOfObjects = Object.keys(incomingObjectList).map((key) => ({ ...incomingObjectList[key] })); // Dale removed replacement of id with the key because the key is not the personId
  arrayOfObjects.sort((a, b) => {
    // If either entry doesn't have a dateStartDate, it should be placed at the top
    if (!a.dateStartDate && !b.dateStartDate) return 0; // Both don't have dates, keep original order
    if (!a.dateStartDate) return -1; // a doesn't have a date, it goes first
    if (!b.dateStartDate) return 1; // b doesn't have a date, it goes first

    // If both have dates, compare them
    const dateA = new Date(a.dateStartDate);
    const dateB = new Date(b.dateStartDate);
    return dateB - dateA; // Sort in descending order (most future date first)
  });
  return arrayOfObjects;
};

export const sortByNoTeamFirst = (incomingObjectList, allPeopleTeamIdLists = {}) => {
  if (!incomingObjectList) return [];
  const personIdsInTeams = new Set(Object.keys(allPeopleTeamIdLists));
  // console.log(Object.keys(allPeopleTeamIdLists).includes('67'));

  const arrayOfObjects =  [...incomingObjectList].sort((a, b) => {
    // console.log('sortByNoTeamFirst', a.id, b.id);
    const aNotInTeam = personIdsInTeams.has(String(a.id)) ? 1 : 0; // 0 = no team, comes first
    const bNotInTeam = personIdsInTeams.has(String(b.id)) ? 1 : 0;
    // console.log(aNotInTeam, bNotInTeam, a.id, b.id, aNotInTeam - bNotInTeam);
    return aNotInTeam - bNotInTeam;
  });
  // console.log('first id should be 67 =>', arrayOfObjects[0]?.id);
  return arrayOfObjects;
};
