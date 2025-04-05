import { withStyles } from '@mui/styles';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router';
import styled from 'styled-components';
import { renderLog } from '../common/utils/logging';
import { PageContentContainer } from '../components/Style/pageLayoutStyles';
import TeamHeader from '../components/Team/TeamHeader';
import webAppConfig from '../config';
import { useConnectAppContext, useConnectDispatch } from '../contexts/ConnectAppContext';
import { isSearchTextFoundInTeam } from '../controllers/TeamController';
import capturePersonListRetrieveData from '../models/capturePersonListRetrieveData';
import { captureTeamListRetrieveData } from '../models/TeamModel';
import { METHOD, useFetchData } from '../react-query/WeConnectQuery';


const Teams = () => {
  renderLog('Teams');
  const { apiDataCache, getAppContextValue } = useConnectAppContext();
  const { allPeopleCache, allTeamsCache } = apiDataCache;
  const dispatch = useConnectDispatch();

  const [mostRecentOnlyPeopleFilterChosen, setMostRecentOnlyPeopleFilterChosen] = useState('');
  const [searchText, setSearchText] = useState('');
  const [showAllTeamMembers, setShowAllTeamMembers] = useState(true);
  const [hideInactive, setHideInactive] = useState(true);
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
      setTeamList(teamListSimple);
    }
  }, [allPeopleCache, allTeamsCache]);

  const showTeam = (team) => {
    if (!team || team.teamId < 0) return false; // Invalid person or personId
    const onlyFiltersSelected = getAppContextValue('peopleFilterExactMatchVsLogicalOr') === 'EXACT_MATCH';
    // console.log('onlyFiltersSelected: ', onlyFiltersSelected);
    const numberOfTeamMembersFoundDict = getAppContextValue('numberOfTeamMembersFoundDict');
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
  // const oneTeam = teamList.find((tm) => tm.teamId === 10);
  // console.log('teams render, team.length: ', teamList.length);
  // console.log('teams render, team 10, (cyclorama ) team name: ', oneTeam && oneTeam.teamName);
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
        <TeamsActionBarWrapperSpacer />
        {/*
        <TeamsActionBarWrapper>
          <SearchBarWrapper>
            <SearchBar2024
              clearFunction={clearFunction}
              placeholder="Search existing teams"
              searchFunction={searchFunction}
              searchUpdateDelayTime={0}
            />
          </SearchBarWrapper>
          <ActionBarSection>
            <ActionBarItem>
              <SpanWithLinkStyle
                onClick={() => {
                  // Force the expansion of all
                  setShowAllTeamMembers(undefined);
                  setTimeout(() => {
                    setShowAllTeamMembers(true);
                  }, 100);
                }}
              >
                Expand all
              </SpanWithLinkStyle>
            </ActionBarItem>
            <ActionBarItem>
              <SpanWithLinkStyle
                onClick={() => {
                  // Force the closing of all
                  setShowAllTeamMembers(undefined);
                  setTimeout(() => {
                    setShowAllTeamMembers(false);
                  }, 100);
                }}
              >
                Collapse all
              </SpanWithLinkStyle>
            </ActionBarItem>
          </ActionBarSection>
          <ActionBarSection>
            {viewerCanSeeOrDo(['canAddTeam'], viewerAccessRights) && (
              <ActionBarItem>
                <SpanWithLinkStyle onClick={() => addTeamClick()}>
                  Add team
                </SpanWithLinkStyle>
              </ActionBarItem>
            )}
            {viewerCanSeeOrDo(['canAddTeamMemberAnyTeam'], viewerAccessRights) && (
              <ActionBarItem>
                <SpanWithLinkStyle onClick={() => addTeamMemberClick()}>
                  Add team member
                </SpanWithLinkStyle>
              </ActionBarItem>
            )}
          </ActionBarSection>
          <FilterPeopleTripleDot />
        </TeamsActionBarWrapper>
        */}
        {/* NOTE: we had discussed refactoring team-list-retrieve to not include person data, */}
        {/* so that team.teamMemberList would only include the personIds of team members */}
        {teamList.map((team) => {
          if (showTeam(team)) {
            return (
              <OneTeamWrapper key={`team-${team.id}`}>
                <TeamHeader
                  hideInactive={hideInactive}
                  searchText={searchText}
                  showAllTeamMembersFromParent={showAllTeamMembers}
                  showIcons
                  team={team}
                />
              </OneTeamWrapper>
            );
          } else {
            return null;
          }
        })}
        <div style={{ padding: '100px 0 50px 0', fontWeight: '700' }}>
          <Link to="/login">
            Temporary link to /login page
          </Link>
        </div>
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

const TeamsActionBarWrapperSpacer = styled('div')`
  margin-top: 60px;
`;

export default withStyles(styles)(Teams);
