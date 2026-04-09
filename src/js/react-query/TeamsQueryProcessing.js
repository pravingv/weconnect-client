// export const getTeamList = (teamListData) => {
//   // const teamListRaw = teamListData.teamList;
//
//   // Copied from TeamStore, this code does nothing
//   // const teamList = [];
//   // let teamFiltered;
//   // let teamRaw;
//   // for (let i = 0; i < teamListRaw.length; i++) {
//   //   teamRaw = teamListRaw[i];
//   //   teamFiltered = teamRaw;
//   //   teamList.push(teamFiltered);
//   // }
//   return teamListData.teamList;
// };

export const getTeamPersonsList = (teamListData, teamId) => {
  console.log('TeamsQueryProcessing, getTeamPersonsList teamId:', teamId);
  const { teamMemberList } = teamListData;
  return teamMemberList;

  // const teamList = [];
  // let teamFiltered;
  // let teamRaw;
  // for (let i = 0; i < teamListRaw.length; i++) {
  //   teamRaw = teamListRaw[i];
  //   teamFiltered = teamRaw;
  //   teamList.push(teamFiltered);
  // }
  // return teamList;
};

export const teamRetrieve = (dataTeamPersons, teamId) => {
  console.log('TeamsQueryProcessing, teamRetrieve teamId:', teamId);
  return dataTeamPersons;
};
