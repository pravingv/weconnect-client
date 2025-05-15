import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';
import { useConnectAppContext, useConnectDispatch } from '../../contexts/ConnectAppContext';
import capturePersonListRetrieveData from '../../models/capturePersonListRetrieveData';
import { METHOD, useFetchData } from '../../react-query/WeConnectQuery';
import { isPersonActive, showPersonInMemberList } from '../../utils/showPerson';
import PersonSummaryRow from '../Person/PersonSummaryRow';

const CohortMemberList = ({ expandAllTeamMembers, hideInactive, searchText, showNotOnTeam, showStatusOfferDecisionNeeded }) => {
  renderLog('CohortMemberList');
  const { apiDataCache, getAppContextValue } = useConnectAppContext();
  const { allPeopleCache, allTeamMembersCache } = apiDataCache || {};
  const dispatch = useConnectDispatch();
  // console.log('CohortMemberList teamMemberList:', teamMemberList);

  const [cohortMemberList, setCohortMemberList] = useState([]);

  const personListRetrieveResults = useFetchData(['person-list-retrieve'], {}, METHOD.GET);
  useEffect(() => {
    if (personListRetrieveResults) {
      capturePersonListRetrieveData(personListRetrieveResults, apiDataCache, dispatch);
    }
  }, [personListRetrieveResults, allPeopleCache, dispatch]);

  useEffect(() => {
    if (allPeopleCache && allTeamMembersCache && showNotOnTeam) {
      const allPeople = Object.values(allPeopleCache);
      const peopleOnTeams = new Set(Object.values(allTeamMembersCache).flat());
      const cohortMemberListTemp = allPeople.filter((person) => !peopleOnTeams.has(person.personId));
      setCohortMemberList(cohortMemberListTemp);
    }
  }, [allPeopleCache, allTeamMembersCache, showNotOnTeam]);

  useEffect(() => {
    let cohortMemberListTemp = [];
    if (allPeopleCache && showStatusOfferDecisionNeeded) {
      cohortMemberListTemp = Object.values(allPeopleCache).filter((person) => person.statusOfferDecisionNeeded === true);
      setCohortMemberList(cohortMemberListTemp);
    }
  }, [allPeopleCache, showStatusOfferDecisionNeeded]);

  // if (showStatusOfferDecisionNeeded) {
  //   console.log('showStatusOfferDecisionNeeded: true');
  // }
  // if (showNotOnTeam) {
  //   console.log('showNotOnTeam: true');
  // }
  // console.log('CohortMemberList cohortMemberList:', cohortMemberList);
  return (
    <TeamMembersWrapper>
      {cohortMemberList.map((person) => {
        // if (teamId === 10) console.log(`CohortMemberList teamId: ${teamId}, person: ${person} location ${person.location}`);
        if (showPersonInMemberList(person, searchText, getAppContextValue) && (isPersonActive(person) || !hideInactive)) {
          return (
            <PersonSummaryRow
              personRowUnfurledFromParent={expandAllTeamMembers}
              key={`cohortMember-offerDecisionNeeded-${person.id}`}
              person={person}
            />
          );
        } else {
          return null; // Empty row for members we don't want to show
        }
      })}
    </TeamMembersWrapper>
  );
};
CohortMemberList.propTypes = {
  expandAllTeamMembers: PropTypes.bool,
  hideInactive: PropTypes.bool,
  searchText: PropTypes.string,
  showNotOnTeam: PropTypes.bool,
  showStatusOfferDecisionNeeded: PropTypes.bool,
};

const styles = () => ({
});

const TeamMembersWrapper = styled('div')`
`;

export default withStyles(styles)(CohortMemberList);
