import { withStyles } from '@mui/styles';
import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';
import arrayContains from '../common/utils/arrayContains';
import { renderLog } from '../common/utils/logging';
import { PageContentContainer } from '../components/Style/pageLayoutStyles';
import TeamHeader from '../components/Team/TeamHeader';
import webAppConfig from '../config';
import { useConnectAppContext, useConnectDispatch } from '../contexts/ConnectAppContext';
import capturePersonListRetrieveData from '../models/capturePersonListRetrieveData';
import { captureTeamListRetrieveData, getTeamMemberPersonListByTeamId } from '../models/TeamModel';
import { METHOD, useFetchData } from '../react-query/WeConnectQuery';
import { showPersonInMemberList } from '../utils/showPerson';
import { showCohortTeam, showTeam } from '../utils/showTeam';
import { DEPARTMENTS, DEPARTMENT_LIST } from '../constants/DepartmentConstants';
import { SettingsApplications } from '@mui/icons-material';
import useRedirectToLoginIfLoggedOut from '../utils/useRedirectToLoginIfLoggedOut';


const Teams = () => {
  renderLog('Teams');
  const { apiDataCache, getAppContextValue, setAppContextValue } = useConnectAppContext();
  const { allPeopleCache, allTeamMembersCache, allTeamsCache } = apiDataCache;
  const dispatch = useConnectDispatch();

  const [mostRecentOnlyPeopleFilterChosen, setMostRecentOnlyPeopleFilterChosen] = useState('');
  const [searchText, setSearchText] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All teams');
  const [showAllTeamMembers, setShowAllTeamMembers] = useState(true);
  const [statusNotOnTeamCohortMemberList, setStatusNotOnTeamCohortMemberList] = useState([]);
  const [statusOfferDecisionNeededCohortMemberList, setStatusOfferDecisionNeededCohortMemberList] = useState([]);
  const [teamList, setTeamList] = useState([]);
  const [apiRetrieveErrorsInARowCount, setApiRetrieveErrorsInARowCount] = useState(0);

  const personListRetrieveResults = useFetchData(['person-list-retrieve'], {}, METHOD.GET);

  useEffect(() => {
    // console.log('useFetchData person-list-retrieve in Teams useEffect:', personListRetrieveResults);
    if (personListRetrieveResults) {
      console.log('In useEffect apiDataCache:', apiDataCache);
      // const changeResults =
      capturePersonListRetrieveData(personListRetrieveResults, apiDataCache, dispatch);
      //console.log('ConnectAppContext useEffect capturePersonListRetrieveData changeResults:', changeResults);
    }
  }, [personListRetrieveResults, allPeopleCache, dispatch]);

  const teamListRetrieveResults = useFetchData(['team-list-retrieve'], {}, METHOD.GET);
  const API_RETRIEVE_ERRORS_IN_A_ROW_THRESHOLD = 50;
  useRedirectToLoginIfLoggedOut(teamListRetrieveResults, API_RETRIEVE_ERRORS_IN_A_ROW_THRESHOLD);


  // ////////////////////////////////////////////
  // Dale's approach to use organize incoming data and then use that data from apiDataCache
  // Allows us to organize incoming data independent of the specific API, potentially from multiple API or sources
  useEffect(() => {
    if (teamListRetrieveResults) {
      // TODO Consider making this useCaptureTeamListRetrieveData so we don't have to pass in the apiDataCache or dispatch
      captureTeamListRetrieveData(teamListRetrieveResults, apiDataCache, dispatch);
    }
  }, [teamListRetrieveResults, apiDataCache, dispatch]);

  useEffect(() => {
    if (allTeamsCache) {
      const teamListSimple = Object.values(allTeamsCache);
      // Sort teamListSimple alphabetically
      const teamListSimpleSorted = teamListSimple.sort((a, b) => {
        if (a.teamName < b.teamName) return -1;
        if (a.teamName > b.teamName) return 1;
        return 0;
      });
      setTeamList(teamListSimpleSorted);
    }
  }, [allPeopleCache, allTeamsCache]);

  useEffect(() => {
    let mostRecentOnlyPeopleFilterChosenUpdated = '';
    // console.log('getAppContextValue(\'isInternPeopleFilter\'): ', getAppContextValue('isInternPeopleFilter'));
    if (getAppContextValue('isInternPeopleFilter')) {
      mostRecentOnlyPeopleFilterChosenUpdated = 'isInternPeopleFilter';
    } else if (getAppContextValue('isHiringManagerPeopleFilter')) {
      mostRecentOnlyPeopleFilterChosenUpdated = 'isHiringManagerPeopleFilter';
    } else if (getAppContextValue('isTeamLeadPeopleFilter')) {
      mostRecentOnlyPeopleFilterChosenUpdated = 'isTeamLeadPeopleFilter';
    } else if (getAppContextValue('statusInOfferProcessPeopleFilter')) {
      mostRecentOnlyPeopleFilterChosenUpdated = 'statusInOfferProcessPeopleFilter';
    } else if (getAppContextValue('statusOnLeavePeopleFilter')) {
      mostRecentOnlyPeopleFilterChosenUpdated = 'statusOnLeavePeopleFilter';
    } else if (getAppContextValue('statusResignedPeopleFilter')) {
      mostRecentOnlyPeopleFilterChosenUpdated = 'statusResignedPeopleFilter';
    }
    // console.log('teams useEffect, mostRecentOnlyPeopleFilterChosen: ', mostRecentOnlyPeopleFilterChosen, ', mostRecentOnlyPeopleFilterChosenUpdated:', mostRecentOnlyPeopleFilterChosenUpdated);
    if (mostRecentOnlyPeopleFilterChosenUpdated && mostRecentOnlyPeopleFilterChosenUpdated !== mostRecentOnlyPeopleFilterChosen) {
      setMostRecentOnlyPeopleFilterChosen(mostRecentOnlyPeopleFilterChosenUpdated);
    }
  }, [getAppContextValue]);

  useEffect(() => {
    if (getAppContextValue('teamsActionBarSearchText') !== searchText) {
      setSearchText(getAppContextValue('teamsActionBarSearchText'));
    }
    if (getAppContextValue('teamsActionBarShowAllTeamMembers') !== showAllTeamMembers) {
      setShowAllTeamMembers(getAppContextValue('teamsActionBarShowAllTeamMembers'));
    }
  }, [getAppContextValue]);

  useEffect(() => {
    let visiblePeopleCount = 0;
    const alreadyCountedList = [];
    teamList.forEach((team) => {
      if (showTeam(team, searchText, getAppContextValue)) {
        const updatedTeamMemberList = getTeamMemberPersonListByTeamId(team.id, apiDataCache);
        updatedTeamMemberList.forEach((person) => {
          if (showPersonInMemberList(person, searchText, getAppContextValue)) {
            if (!arrayContains(person.id, alreadyCountedList)) {
              alreadyCountedList.push(person.id);
              visiblePeopleCount++;
            }
          }
        });
      }
    });
    // console.log('teams useEffect, visiblePeopleCount: ', visiblePeopleCount);
    if (visiblePeopleCount !== getAppContextValue('teamsPageVisiblePeopleCount')) {
      setAppContextValue('teamsPageVisiblePeopleCount', visiblePeopleCount);
    }
  }, [getAppContextValue, searchText, teamList]);

  useEffect(() => {
    if (allPeopleCache && allTeamMembersCache) {
      const allPeople = Object.values(allPeopleCache);
      // const peopleOnTeams = new Set(Object.values(allTeamMembersCache).flat());
      // const cohortMemberListTemp = allPeople.filter((person) => !peopleOnTeams.has(person.personId));
      const teamMemberPersonIdsSet = new Set(
        Object.values(allTeamMembersCache)
          .flat()
          .map((teamMember) => teamMember.personId),
      );
      const teamMemberPersonIds = Array.from(teamMemberPersonIdsSet);
      // console.log('teams useEffect, teamMemberPersonIds: ', teamMemberPersonIds);
      // Filter allPeople to get those not in any team
      const cohortMemberListTemp = allPeople.filter((person) => !arrayContains(person.personId, teamMemberPersonIds));
      setStatusNotOnTeamCohortMemberList(cohortMemberListTemp);
    }
  }, [allPeopleCache, allTeamMembersCache]);

  useEffect(() => {
    let cohortMemberListTemp = [];
    if (allPeopleCache) {
      cohortMemberListTemp = Object.values(allPeopleCache).filter((person) => person.statusOfferDecisionNeeded === true);
      setStatusOfferDecisionNeededCohortMemberList(cohortMemberListTemp);
    }
  }, [allPeopleCache]);

  // useEffect(() => {
  //   // Starting with statusOfferDecisionNeededCohortMemberList, using isPersonActive && showPersonInMemberList figure out if any people match
  //   const visiblePeople = statusOfferDecisionNeededCohortMemberList.filter((person) =>
  //     isPersonActive(person) && showPersonInMemberList(person, searchText, getAppContextValue)
  //   );
  //
  //   setShowStatusOfferDecisionNeededCohort(visiblePeople.length > 0);
  // }, [statusOfferDecisionNeededCohortMemberList]);

  useEffect(() => {
    setAppContextValue('teamsActionBarShowAllTeamMembers', true);
  }, []);

  const showCohortsForSelectedDepartment =
    selectedDepartment === DEPARTMENTS.ALL_TEAMS || selectedDepartment === DEPARTMENTS.OTHER;

  return (
    <div>
      <Helmet>
        <title>
          Teams -
          {' '}
          {webAppConfig.NAME_FOR_BROWSER_TAB_TITLE}
        </title>
        {/* Don't think we can do this anymore ... <link rel="canonical" href={`${webAppConfig.WECONNECT_URL_FOR_SEO}/team-home`} /> */}
      </Helmet>
      <DepartmentFilterHeader>
        {DEPARTMENT_LIST.map((dept) => (
          <DepartmentFilterButton
            key={dept}
            $active={selectedDepartment === dept}
            onClick={() => setSelectedDepartment(dept)}
          >
            {dept}
          </DepartmentFilterButton>
        ))}
      </DepartmentFilterHeader>
      <PageContentContainer>
        <ActionBarWrapperSpacer />
        {/* NOTE: we continue working on refactoring team-list-retrieve to not include person data, */}
        {/* so that team.teamMemberList would only include the TeamMember data of team members */}
        {/* We have partially implemented this change by introducing teamMemberInfoList */}
        {teamList.map((team) => {
          const teamIdentifier = team?.teamId || team?.id;
          const teamMatchesDepartmentFilter = selectedDepartment === 'All teams' ||
            (team.departments && team.departments.includes(selectedDepartment));

          if (showTeam(team, searchText, getAppContextValue) && teamMatchesDepartmentFilter) {
            return (
              <OneTeamWrapper key={`team-${teamIdentifier}`}>
                <TeamHeader
                  searchText={searchText}
                  showAllTeamMembersFromParent={showAllTeamMembers}
                  team={team}
                />
              </OneTeamWrapper>
            );
          } else {
            return null;
          }
        })}
        {showCohortsForSelectedDepartment && showCohortTeam(searchText, statusOfferDecisionNeededCohortMemberList, false, true) && (
          <OneTeamWrapper key="team-offerDecisionNeeded">
            <TeamHeader
              hideTeamMemberCount
              searchText={searchText}
              showAllTeamMembersFromParent={showAllTeamMembers}
              showStatusOfferDecisionNeeded
            />
          </OneTeamWrapper>
        )}
        {showCohortsForSelectedDepartment && showCohortTeam(searchText, statusNotOnTeamCohortMemberList, true, false) && (
          <OneTeamWrapper key="team-notOnTeam">
            <TeamHeader
              hideTeamMemberCount
              searchText={searchText}
              showAllTeamMembersFromParent={showAllTeamMembers}
              showNotOnTeam
            />
          </OneTeamWrapper>
        )}
      </PageContentContainer>
    </div>
  );
};
Teams.propTypes = {
};

const styles = () => ({
});

const OneTeamWrapper = styled('div')`
`;

const ActionBarWrapperSpacer = styled('div')`
  margin-top: 170px;
`;

const DepartmentFilterHeader = styled('div')`
  position: fixed;
  top: 110px;
  left: 0;
  right: 0;
  z-index: 100;
  background: white;
  border-bottom: 2px solid #e5e5e5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 6px;
  flex-wrap: wrap;
`;

const DepartmentFilterButton = styled('button')`
  border: 1px solid ${(props) => (props.$active ? '#1e6fb9' : '#d0d0d0')};
  background: ${(props) => (props.$active ? '#1e6fb9' : 'white')};
  color: ${(props) => (props.$active ? 'white' : '#333')};
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: ${(props) => (props.$active ? '600' : '500')};
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;

  &:hover {
    background: ${(props) => (props.$active ? '#1a5a94' : '#f5f5f5')};
    border-color: ${(props) => (props.$active ? '#1a5a94' : '#b0b0b0')};
  }

  &:active {
    transform: scale(0.98);
  }
`;

export default withStyles(styles)(Teams);
