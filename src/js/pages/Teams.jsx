import { withStyles } from '@mui/styles';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';
import arrayContains from '../common/utils/arrayContains';
import { renderLog } from '../common/utils/logging';
import { PageContentContainer } from '../components/Style/pageLayoutStyles';
import TeamHeader from '../components/Team/TeamHeader';
import webAppConfig from '../config';
import { useConnectAppContext, useConnectDispatch } from '../contexts/ConnectAppContext';
import { isSearchTextFoundInTeam } from '../controllers/TeamController';
import capturePersonListRetrieveData from '../models/capturePersonListRetrieveData';
import { captureTeamListRetrieveData, getTeamMembersListByTeamId } from '../models/TeamModel';
import { METHOD, useFetchData } from '../react-query/WeConnectQuery';
import { showPersonInMemberList } from '../utils/showPerson';


const Teams = () => {
  renderLog('Teams');
  const { apiDataCache, getAppContextValue, setAppContextValue } = useConnectAppContext();
  const { allPeopleCache, allTeamsCache } = apiDataCache;
  const dispatch = useConnectDispatch();

  const [mostRecentOnlyPeopleFilterChosen, setMostRecentOnlyPeopleFilterChosen] = useState('');
  const [searchText, setSearchText] = useState('');
  const [showAllTeamMembers, setShowAllTeamMembers] = useState(true);
  const [teamList, setTeamList] = useState([]);

  const personListRetrieveResults = useFetchData(['person-list-retrieve'], {}, METHOD.GET);
  useEffect(() => {
    // console.log('useFetchData person-list-retrieve in Teams useEffect:', personListRetrieveResults);
    if (personListRetrieveResults) {
      // console.log('In useEffect apiDataCache:', apiDataCache);
      // const changeResults =
      capturePersonListRetrieveData(personListRetrieveResults, apiDataCache, dispatch);
      // console.log('ConnectAppContext useEffect capturePersonListRetrieveData changeResults:', changeResults);
    }
  }, [personListRetrieveResults, allPeopleCache, dispatch]);

  const teamListRetrieveResults = useFetchData(['team-list-retrieve'], {}, METHOD.GET);
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

  const showTeam = (team) => {
    if (!team || team.teamId < 0) return false; // Invalid person or personId
    const onlyFiltersSelected = getAppContextValue('peopleFilterExactMatchVsLogicalOr') === 'EXACT_MATCH';
    // console.log('onlyFiltersSelected: ', onlyFiltersSelected);
    const numberOfTeamMembersFoundDict = getAppContextValue('numberOfTeamMembersFoundDict');
    if (!numberOfTeamMembersFoundDict) return false; // No data yet
    try {
      const teamMembersFound = numberOfTeamMembersFoundDict[team.teamId] && numberOfTeamMembersFoundDict[team.teamId] > 0;
      // console.log('showTeam, team.teamId: ', team.teamId, ', team.teamName: ', team.teamName, ', teamMembersFound: ', teamMembersFound);
      if (searchText) {
        // If the team has any members matching searchText, or team itself matches searchText, show it
        // console.log('searchText: ', searchText, ', team.teamName: ', team.teamName);
        return !!(teamMembersFound) || isSearchTextFoundInTeam(searchText, team);
      } else if (onlyFiltersSelected) {
        return !!(teamMembersFound);
      } else {
        return true; // Show the team if no searchText is provided
      }
    } catch (error) {
      console.error('Error in showTeam:', error);
      return false;
    }
  };

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
      if (showTeam(team)) {
        const updatedTeamMemberList = getTeamMembersListByTeamId(team.id, apiDataCache);
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
    setAppContextValue('teamsActionBarShowAllTeamMembers', true);
  }, []);

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
      <PageContentContainer>
        <ActionBarWrapperSpacer />
        {/* NOTE: we had discussed refactoring team-list-retrieve to not include person data, */}
        {/* so that team.teamMemberList would only include the personIds of team members */}
        {teamList.map((team) => {
          if (showTeam(team)) {
            return (
              <OneTeamWrapper key={`team-${team.id}`}>
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
        <OneTeamWrapper key="team-offerDecisionNeeded">
          <TeamHeader
            searchText={searchText}
            showAllTeamMembersFromParent={showAllTeamMembers}
            showStatusOfferDecisionNeeded
          />
        </OneTeamWrapper>
        <OneTeamWrapper key="team-notOnTeam">
          <TeamHeader
            searchText={searchText}
            showAllTeamMembersFromParent={showAllTeamMembers}
            showNotOnTeam
          />
        </OneTeamWrapper>
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
  margin-top: 60px;
`;

export default withStyles(styles)(Teams);
