import { withStyles } from '@mui/styles';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router';
import styled from 'styled-components';
import SearchBar2024 from '../common/components/Search/SearchBar2024';
import DesignTokenColors from '../common/components/Style/DesignTokenColors';
import { renderLog } from '../common/utils/logging';
import { SpanWithLinkStyle } from '../components/Style/linkStyles';
import { PageContentContainer } from '../components/Style/pageLayoutStyles';
import TeamHeader from '../components/Team/TeamHeader';
import TeamMemberList from '../components/Team/TeamMemberList';
import webAppConfig from '../config';
import { useConnectAppContext, useConnectDispatch } from '../contexts/ConnectAppContext';
import { isSearchTextFoundInPerson } from '../controllers/PersonController';
import { isSearchTextFoundInTeam } from '../controllers/TeamController';
import capturePersonListRetrieveData from '../models/capturePersonListRetrieveData';
import { viewerCanSeeOrDo } from '../models/AuthModel';
import { captureTeamListRetrieveData, getTeamMembersListByTeamId } from '../models/TeamModel';
import { METHOD, useFetchData } from '../react-query/WeConnectQuery';


const Teams = () => {
  renderLog('Teams');
  const { apiDataCache, setAppContextValue, getAppContextValue } = useConnectAppContext();
  const { viewerAccessRights, allPeopleCache, allTeamsCache } = apiDataCache;
  const dispatch = useConnectDispatch();

  const [searchText, setSearchText] = useState('');
  const [showAllTeamMembers, setShowAllTeamMembers] = useState(true);
  const [teamList, setTeamList] = useState([]);

  const clearFunction = () => {
    setSearchText('');
  };

  const searchFunction = (incomingSearchText) => {
    // console.log('AddTeamDrawerMainContent searchFunction incomingSearchText: ', incomingSearchText);
    setSearchText(incomingSearchText);
  };

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

  useEffect(() => {
    const personProfile = getAppContextValue('personProfileDrawerOpen');
    if (personProfile === undefined) {
      setAppContextValue('personProfileDrawerOpen', false);
      setAppContextValue('addTeamDrawerOpen', false);
    }
  }, []);

  const addTeamClick = () => {
    setAppContextValue('addTeamDrawerOpen', true);
    setAppContextValue('AddTeamDrawerLabel', 'Add Team');
  };

  const addTeamMemberClick = () => {
    setAppContextValue('addPersonDrawerOpen', true);
    setAppContextValue('AddPersonDrawerLabel', 'Add Person');
  };

  const updateTeamMembersFoundDictWithOneTeam = (teamId, numberOfTeamMembersFound, numberOfTeamMembersFoundDictLocal) => {
    const numberOfTeamMembersFoundDictRevised = { ...numberOfTeamMembersFoundDictLocal };
    if (teamId) {
      if (numberOfTeamMembersFoundDictLocal[teamId] !== numberOfTeamMembersFound) {
        numberOfTeamMembersFoundDictRevised[teamId] = numberOfTeamMembersFound;
      }
    }
    return numberOfTeamMembersFoundDictRevised;
  };

  // Refresh the numberOfTeamMembersFoundDict as a person searches
  // key is teamId, value is number of team members found
  useEffect(() => {
    const numberOfTeamMembersFoundDict = getAppContextValue('numberOfTeamMembersFoundDict');
    let numberOfTeamMembersFoundDictRevised = { ...numberOfTeamMembersFoundDict };
    let teamId;
    let numberOfTeamMembersFound;
    teamList.forEach((team) => {
      teamId = team.teamId;
      const updatedTeamMemberList = getTeamMembersListByTeamId(teamId, apiDataCache);
      if (searchText) {
        numberOfTeamMembersFound = updatedTeamMemberList.filter((person) => isSearchTextFoundInPerson(searchText, person)).length;
      } else {
        numberOfTeamMembersFound = updatedTeamMemberList.length;
      }
      numberOfTeamMembersFoundDictRevised = updateTeamMembersFoundDictWithOneTeam(teamId, numberOfTeamMembersFound, numberOfTeamMembersFoundDictRevised);
    });
    setAppContextValue('numberOfTeamMembersFoundDict', numberOfTeamMembersFoundDictRevised);
  }, [apiDataCache, searchText, teamList]);

  const showTeam = (team) => {
    if (!team || team.teamId < 0) return false; // Invalid person or personId
    if (searchText) {
      const numberOfTeamMembersFoundDict = getAppContextValue('numberOfTeamMembersFoundDict');
      const teamMembersFound = numberOfTeamMembersFoundDict[team.teamId] && numberOfTeamMembersFoundDict[team.teamId] > 0;
      // If the team has any members matching searchText, or team itself matches searchText, show it
      return !!(teamMembersFound) || isSearchTextFoundInTeam(searchText, team);
    } else {
      return true; // Show the team if no searchText is provided
    }
  };

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
        <ActionBarWrapper>
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
              {showAllTeamMembers ? (
                <SpanWithLinkStyle onClick={() => setShowAllTeamMembers(false)}>
                  Collapse all
                </SpanWithLinkStyle>
              ) : (
                <SpanWithLinkStyle onClick={() => setShowAllTeamMembers(true)}>
                  Expand all
                </SpanWithLinkStyle>
              )}
            </ActionBarItem>
          </ActionBarSection>
          <ActionBarSection>
            {viewerCanSeeOrDo('canAddTeam', viewerAccessRights) && (
              <ActionBarItem>
                <SpanWithLinkStyle onClick={() => addTeamClick()}>
                  Add team
                </SpanWithLinkStyle>
              </ActionBarItem>
            )}
            {viewerCanSeeOrDo('canAddTeamMemberAnyTeam', viewerAccessRights) && (
              <ActionBarItem>
                <SpanWithLinkStyle onClick={() => addTeamMemberClick()}>
                  Add team member
                </SpanWithLinkStyle>
              </ActionBarItem>
            )}
          </ActionBarSection>
        </ActionBarWrapper>
        {/* NOTE: we had discussed refactoring team-list-retrieve to not include person data, */}
        {/* so that team.teamMemberList would only include the personIds of team members */}
        {teamList.map((team, index) => {
          if (showTeam(team)) {
            return (
              <OneTeamWrapper key={`team-${team.id}`}>
                <TeamHeader
                  team={team}
                  showHeaderLabels={(index === 0) && showAllTeamMembers && (team.teamMemberList && team.teamMemberList.length > 0)}
                  showIcons
                />
                {showAllTeamMembers && (
                  <>
                    {/* DO NOT REMOVE PASSED IN team */}
                    <TeamMemberList
                      searchText={searchText}
                      team={team}
                      teamId={team.id}
                    />
                  </>
                )}
              </OneTeamWrapper>
            );
          } else {
            return null;
          }
        })}
        <div style={{ padding: '100px 0 50px 0', fontWeight: '700' }}>
          <Link to="/login">
            Sign in
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

const ActionBarItem = styled('div')`
  padding-right: 15px;
`;

const ActionBarSection = styled('div')`
  align-items: center;
  border-right: 1px solid ${DesignTokenColors.neutralUI200};
  display: flex;
  font-size: .8em;
  justify-content: flex-start;
  padding-left: 15px;
`;

const ActionBarWrapper = styled('div')`
  align-items: center;
  display: flex;
  justify-content: flex-start;
  margin-top: 40px;  // Temporary hack
`;

const OneTeamWrapper = styled('div')`
`;

const SearchBarWrapper = styled('div')`
  margin-right: 10px;
`;

export default withStyles(styles)(Teams);
