import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import SearchBar2024 from '../../common/components/Search/SearchBar2024';
import { renderLog } from '../../common/utils/logging';
import FilterPeopleTripleDot from '../Person/FilterPeopleTripleDot';
import { ActionBarItem, ActionBarSection, SearchBarWrapper } from '../Style/actionBarStyles';
import { SpanWithLinkStyle } from '../Style/linkStyles';
import { useConnectAppContext } from '../../contexts/ConnectAppContext';
import { onlyShowPersonWithPeopleFiltersExactMatch, isSearchTextFoundInPerson } from '../../controllers/PersonController';
import { viewerCanSeeOrDo } from '../../models/AuthModel';
import { getTeamMembersListByTeamId } from '../../models/TeamModel';


const TeamsActionBar = () => {
  renderLog('TeamsActionBar');
  const { apiDataCache, setAppContextValue, getAppContextValue } = useConnectAppContext();
  const { allPeopleCache, allTeamsCache, viewerAccessRights } = apiDataCache;

  const [mostRecentOnlyPeopleFilterChosen, setMostRecentOnlyPeopleFilterChosen] = useState('');
  const [searchText, setSearchText] = useState('');
  const [teamList, setTeamList] = useState([]);

  const clearFunction = () => {
    setSearchText(''); // For local use only
    setAppContextValue('teamsActionBarSearchText', '');
  };

  const searchFunction = (incomingSearchText) => {
    setSearchText(incomingSearchText); // For local use only
    setAppContextValue('teamsActionBarSearchText', incomingSearchText);
  };

  useEffect(() => {
    if (allTeamsCache) {
      const teamListSimple = Object.values(allTeamsCache);
      setTeamList(teamListSimple);
    }
  }, [allPeopleCache, allTeamsCache]);

  const addTeamClick = () => {
    setAppContextValue('addTeamDrawerOpen', true);
    setAppContextValue('AddTeamDrawerLabel', 'Add Team');
  };

  const addTeamMemberClick = () => {
    setAppContextValue('addPersonDrawerOpen', true);
    setAppContextValue('AddPersonDrawerLabel', 'Add Person');
  };

  // const hideInactiveClick = () => {
  //   setHideInactive(!hideInactive);
  // };

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
    const onlyFiltersSelected = getAppContextValue('peopleFilterExactMatchVsLogicalOr') === 'EXACT_MATCH';
    // console.log('searchText: ', searchText, ', onlyFiltersSelected: ', onlyFiltersSelected);
    teamList.forEach((team) => {
      teamId = team.teamId;
      const updatedTeamMemberList = getTeamMembersListByTeamId(teamId, apiDataCache);
      if (searchText) {
        // numberOfTeamMembersFound = updatedTeamMemberList.filter((person) => isSearchTextFoundInPerson(searchText, person)).length;
        numberOfTeamMembersFound = updatedTeamMemberList.filter((person) => {
          const personResults = isSearchTextFoundInPerson(searchText, person);
          return personResults.allSearchWordsWereFound;
        }).length;
      } else if (onlyFiltersSelected) {
        numberOfTeamMembersFound = updatedTeamMemberList.filter((person) => onlyShowPersonWithPeopleFiltersExactMatch(person, getAppContextValue)).length;
      } else {
        numberOfTeamMembersFound = updatedTeamMemberList.length;
      }
      numberOfTeamMembersFoundDictRevised = updateTeamMembersFoundDictWithOneTeam(teamId, numberOfTeamMembersFound, numberOfTeamMembersFoundDictRevised);
    });
    // console.log('teams useEffect, numberOfTeamMembersFoundDictRevised: ', numberOfTeamMembersFoundDictRevised);
    setAppContextValue('numberOfTeamMembersFoundDict', numberOfTeamMembersFoundDictRevised);
  }, [apiDataCache, mostRecentOnlyPeopleFilterChosen, searchText, teamList]);

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

  // const oneTeam = teamList.find((tm) => tm.teamId === 10);
  // console.log('teams render, team.length: ', teamList.length);
  // console.log('teams render, team 10, (cyclorama ) team name: ', oneTeam && oneTeam.teamName);
  return (
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
              // setShowAllTeamMembers(undefined);
              setAppContextValue('teamsActionBarShowAllTeamMembers', undefined);
              setTimeout(() => {
                // setShowAllTeamMembers(true);
                setAppContextValue('teamsActionBarShowAllTeamMembers', true);
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
              // setShowAllTeamMembers(undefined);
              setAppContextValue('teamsActionBarShowAllTeamMembers', undefined);
              setTimeout(() => {
                // setShowAllTeamMembers(false);
                setAppContextValue('teamsActionBarShowAllTeamMembers', false);
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
        {/* <ActionBarItem> */}
        {/*  <SpanWithLinkStyle onClick={() => hideInactiveClick()}> */}
        {/*    {hideInactive ? 'Show inactive team members' : 'Hide inactive team members'} */}
        {/*  </SpanWithLinkStyle> */}
        {/* </ActionBarItem> */}
      </ActionBarSection>
      <FilterPeopleTripleDot />
    </TeamsActionBarWrapper>
  );
};
TeamsActionBar.propTypes = {
};

const TeamsActionBarWrapper = styled('div')`
  align-items: center;
  display: flex;
  justify-content: flex-start;
`;

export default TeamsActionBar;
