import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';
import { useConnectAppContext, useConnectDispatch } from '../../contexts/ConnectAppContext';
import capturePersonListRetrieveData from '../../models/capturePersonListRetrieveData';
import { getTeamMemberPersonListByTeamId } from '../../models/TeamModel';
import { METHOD, useFetchData } from '../../react-query/WeConnectQuery';
import { isPersonActive, showPersonInMemberList } from '../../utils/showPerson';
import PersonSummaryRow from '../Person/PersonSummaryRow';

// DO NOT REMOVE PASSED in TEAM
const TeamMemberList = ({ expandAllTeamMembers, hideInactive, searchText, teamId, team }) => { // teamMemberList
  renderLog('TeamMemberList');
  const { apiDataCache, getAppContextValue } = useConnectAppContext();
  const { allPeopleCache } = apiDataCache;
  const dispatch = useConnectDispatch();

  const [teamMemberListApiDataCache, setTeamMemberListApiDataCache] = useState([]);
  const [teamMemberListReactQuery, setTeamMemberListReactQuery] = useState(team.teamMemberList || []);

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
    const updatedTeamMemberList = getTeamMemberPersonListByTeamId(teamId, apiDataCache);
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

  return (
    <TeamMembersWrapper>
      {teamMemberListApiDataCache.map((person) => {
        // if (teamId === 10) console.log(`TeamMemberList teamId: ${teamId}, person: ${person} location ${person.location}`);
        if (showPersonInMemberList(person, searchText, getAppContextValue) && (isPersonActive(person) || !hideInactive)) {
          return (
            <PersonSummaryRow
              personRowUnfurledFromParent={expandAllTeamMembers}
              key={`teamMember-${teamId}-${person.id}`}
              person={person}
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
  expandAllTeamMembers: PropTypes.bool,
  hideInactive: PropTypes.bool,
  searchText: PropTypes.string,
  teamId: PropTypes.any.isRequired,
  team: PropTypes.object.isRequired,
};

const styles = () => ({
});

const TeamMembersWrapper = styled('div')`
`;

export default withStyles(styles)(TeamMemberList);
