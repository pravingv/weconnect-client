import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';
import { isSearchTextFoundInPerson } from '../../controllers/PersonController';
import { useConnectAppContext, useConnectDispatch } from '../../contexts/ConnectAppContext';
import capturePersonListRetrieveData from '../../models/capturePersonListRetrieveData';
import { getTeamMembersListByTeamId } from '../../models/TeamModel';
import { METHOD, useFetchData } from '../../react-query/WeConnectQuery';
import PersonSummaryRow from '../Person/PersonSummaryRow';

// DO NOT REMOVE PASSED in TEAM
const TeamMemberList = ({ searchText, teamId, team, hideInactive }) => { // teamMemberList
  renderLog('TeamMemberList');
  const { apiDataCache } = useConnectAppContext();
  const { allPeopleCache } = apiDataCache;
  const dispatch = useConnectDispatch();

  const [teamMemberListApiDataCache, setTeamMemberListApiDataCache] = useState([]);
  const [teamMemberListReactQuery, setTeamMemberListReactQuery] = useState(team.teamMemberList || []);
  // const teamMemberList = useGetTeamMembersListByTeamId(teamId);
  // console.log('TeamMemberList teamMemberList:', teamMemberList);

  const personListRetrieveResults = useFetchData(['person-list-retrieve'], {}, METHOD.GET);
  useEffect(() => {
    if (personListRetrieveResults) {
      capturePersonListRetrieveData(personListRetrieveResults, apiDataCache, dispatch);
    }
  }, [personListRetrieveResults, allPeopleCache, dispatch]);

  const { data: dataTLR, isSuccess: isSuccessTLR, isFetching: isFetchingTLR } = useFetchData(['team-list-retrieve'], {}, METHOD.GET);
  // console.log('useFetchData in TeamMemberList:', dataTLR, isSuccessTLR, isFetchingTLR);
  useEffect(() => {
    // console.log('effect of useFetchData in TeamMemberList useEffect:', dataTLR, isSuccessTLR, isFetchingTLR);
    if (dataTLR !== undefined && isSuccessTLR) {
      const oneTeam = dataTLR.teamList.find((tm) => tm.teamId === parseInt(teamId));
      if (oneTeam) {  // We might have just deleted the team
        // NOTE: we had discussed refactoring team-list-retrieve to not include person data,
        // so that team.teamMemberList would only include the personIds of team members
        setTeamMemberListReactQuery(oneTeam.teamMemberList);
      }
    }
  }, [dataTLR, isSuccessTLR]);

  useEffect(() => {
    const updatedTeamMemberList = getTeamMembersListByTeamId(teamId, apiDataCache);
    setTeamMemberListApiDataCache(updatedTeamMemberList);
  }, [apiDataCache, teamId]);

  // const oneTeam = teamList.find((tm) => tm.teamId === parseInt(teamId));

  // DO NOT REMOVE: diffs the ReactQuery cache results with the ApiDataCache
  let isPerfectMatch = true;
  if (teamMemberListReactQuery && teamMemberListApiDataCache && teamMemberListReactQuery.length > 0 && teamMemberListApiDataCache.length > 0) {
    for (let i = 0; i < teamMemberListReactQuery.length; i++) {
      Object.keys(teamMemberListReactQuery[i]).forEach((key) => {
        if (key !== 'id' && !key.startsWith('date')) {
          const valReactQueryCache = teamMemberListReactQuery && teamMemberListReactQuery[i] && teamMemberListReactQuery[i][key];
          const valApiCacheQuery = teamMemberListApiDataCache && teamMemberListApiDataCache[i] && teamMemberListApiDataCache[i][key];
          if (valApiCacheQuery !== valReactQueryCache) {
            // console.log(`ERROR: teamMemberList authoritative ReactQuery cache for key: ${key} value: '${valReactQueryCache}' does not match processed cache value: '${valApiCacheQuery}'`);
            isPerfectMatch = false;
          }
        }
      });
    }
    if (isPerfectMatch) {
      // console.log('=== PERFECT MATCH');
    }
  } else {
    // console.log(`=== CANNOT COMPARE: teamMemberListReactQuery.length: ${teamMemberListReactQuery.length}, teamMemberListApiDataCache.length: ${teamMemberListApiDataCache.length}`);
  }
  // console.log('====== Cached by ReactQuery teamMemberList: ', teamMemberListReactQuery);
  // console.log('====== Cached by apiDataCache teamMemberList: ', teamMemberListApiDataCache);

  const showPerson = (person, searchTextLocal) => {
    if (!person || person.id < 0) return false; // Invalid person or personId
    if (searchTextLocal) {
      return isSearchTextFoundInPerson(searchTextLocal, person);
    } else {
      return true; // Show the person if no searchText is provided
    }
  };

  const isPersonActive = (person) => {
    if (person.dateEndDate === null || !hideInactive) {
      return true;
    }
    const endDate = new Date(person.dateEndDate);
    const nowDate = new Date();
    // console.log(`${person.firstName} ---  ${endDate < nowDate}  ${endDate} ${nowDate}`);
    return endDate > nowDate;
  };

  return (
    <TeamMembersWrapper>
      {teamMemberListApiDataCache.map((person, index) => {
        // if (teamId === 10) console.log(`TeamMemberList teamId: ${teamId}, person: ${person} location ${person.location}`);
        if (showPerson(person, searchText) && isPersonActive(person)) {
          return (
            <PersonSummaryRow
              key={`teamMember-${teamId}-${person.id}`}
              person={person}
              rowNumberForDisplay={index + 1}
              teamId={teamId}
            />
          );
        } else {
          return null; // Empty row for members we don't want to show
        }
      })}
    </TeamMembersWrapper>
  );
};
TeamMemberList.propTypes = {
  searchText: PropTypes.string,
  teamId: PropTypes.any.isRequired,
  team: PropTypes.object.isRequired,
  hideInactive: PropTypes.bool.isRequired,
};

const styles = () => ({
});

const TeamMembersWrapper = styled('div')`
`;

export default withStyles(styles)(TeamMemberList);
