import { PersonAddAltOutlined, Download } from '@mui/icons-material';
import isEqual from 'lodash-es/isEqual';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { jsonToCSV } from 'react-papaparse';
import { saveAs } from 'file-saver';
import SearchBar2024 from '../../common/components/Search/SearchBar2024';
import DesignTokenColors from '../../common/components/Style/DesignTokenColors';
import { renderLog } from '../../common/utils/logging';
import FilterPeopleTripleDot from '../Person/FilterPeopleTripleDot';
import { ActionBarItem, ActionBarSection, SearchBarWrapper } from '../Style/actionBarStyles';
import { SpanWithLinkStyle } from '../Style/linkStyles';
import { useConnectAppContext } from '../../contexts/ConnectAppContext';
import { onlyShowPersonWithPeopleFiltersExactMatch, isSearchTextFoundInPerson } from '../../controllers/PersonController';
import { viewerCanSeeOrDo } from '../../models/AuthModel';
import { getTeamMemberPersonListByTeamId } from '../../models/TeamModel';


const TeamsActionBar = () => {
  renderLog('TeamsActionBar');
  const { apiDataCache, setAppContextValue, getAppContextValue } = useConnectAppContext();
  const { allPeopleCache, allTeamsCache, viewerAccessRights } = apiDataCache;

  const [mostRecentOnlyPeopleFilterChosen, setMostRecentOnlyPeopleFilterChosen] = useState('');
  const [searchText, setSearchText] = useState('');
  const [teamList, setTeamList] = useState([]);
  const [visiblePeopleCount, setVisiblePeopleCount] = useState(0);

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

  //  const hideInactiveClick = () => {
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
      const updatedTeamMemberList = getTeamMemberPersonListByTeamId(teamId, apiDataCache);
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
    if (!isEqual(numberOfTeamMembersFoundDictRevised, numberOfTeamMembersFoundDict)) {
      setAppContextValue('numberOfTeamMembersFoundDict', numberOfTeamMembersFoundDictRevised);
    }
  }, [apiDataCache, getAppContextValue, mostRecentOnlyPeopleFilterChosen, searchText, teamList]);

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
    setVisiblePeopleCount(getAppContextValue('teamsPageVisiblePeopleCount'));
  }, [getAppContextValue]);

  const flattenedData = useMemo(() => {
    if (
      !apiDataCache?.allTeamMembersCache ||
      !apiDataCache?.allTeamsCache ||
      !apiDataCache?.allPeopleCache
    ) return [];

    const { allTeamMembersCache } = apiDataCache;

    const allTeamNames = Object.values(allTeamsCache)
      .map((team) => team.teamName
        .replace(/,/g, '')   // remove commas
        .replace(/\s+/g, '-'))
      .sort((a, b) => a.localeCompare(b));
    const personMap = {};

    Object.entries(allTeamMembersCache).forEach(([teamId, members]) => {
      const team = allTeamsCache[teamId];
      if (!team) return;

      // Clean the team name for the CSV column
      const teamColumnName = team.teamName
        .replace(/,/g, '')
        .replace(/\s+/g, '-');

      members.forEach((member) => {
        const person = allPeopleCache[member.personId];
        if (!person) return;

        if (!personMap[person.personId]) {
          // 2A️⃣ Initialize all person-level fields
          personMap[person.personId] = {
            PersonId: person.personId,
            BirthdayMonthAndDay: person.birthdayMonthAndDay,
            EmailOfficial: person.emailOfficial,
            EmailOfficialAlternate: person.emailOfficialAlternate,
            EmailOfficialVerified: person.emailOfficialVerified,
            EmailPersonal: person.emailPersonal,
            EmailPersonalAlternate: person.emailPersonalAlternate,
            EmailPreferred: person.emailPreferred,
            FirstName: person.firstName,
            FirstNamePreferred: person.firstNamePreferred,
            Gender: person.gender,
            HoursPerWeekEstimate: person.hoursPerWeekEstimate,
            JobTitle: person.jobTitle,
            LastName: person.lastName,
            Location: person.location,
            PhoneNumber: person.phoneNumber,
            StateCode: person.stateCode,
            UploadedImageUrlLarge: person.uploadedImageUrlLarge,
            UploadedImageUrlSmall: person.uploadedImageUrlSmall,
            JazzHrUrl: person.jazzHrUrl,
            LinkedInUrl: person.linkedInUrl,
            DateCreated: person.dateCreated,
            DateEmailCreated: person.dateEmailCreated,
            DateEndDate: person.dateEndDate,
            DateLastActive: person.dateLastActive,
            DateLastOnLeave: person.dateLastOnLeave,
            DateLastUpdated: person.dateLastUpdated,
            DateLastResigned: person.dateLastResigned,
            DateOfferLetterCreated: person.dateOfferLetterCreated,
            DateOfferLetterSigned: person.dateOfferLetterSigned,
            DateStartDate: person.dateStartDate,
            IsAdmin: person.isAdmin,
            IsHRAdmin: person.isHRAdmin,
            IsHROfferAdmin: person.isHROfferAdmin,
            IsHRGeneralist1: person.isHRGeneralist1,
            IsHRGeneralist2: person.isHRGeneralist2,
            IsHiringManager: person.isHiringManager,
            IsIntern: person.isIntern,
            IsTeamLead: person.isTeamLead,
            StatusActive: person.statusActive,
            StatusAvailableForSpecialProjects: person.statusAvailableForSpecialProjects,
            StatusEmailCreated: person.statusEmailCreated,
            StatusOfferApproved: person.statusOfferApproved,
            StatusOfferLetterCreated: person.statusOfferLetterCreated,
            StatusOfferLetterSigned: person.statusOfferLetterSigned,
            StatusOfferDecisionNeeded: person.statusOfferDecisionNeeded,
            StatusOfferQuestionnaireAnswered: person.statusOfferQuestionnaireAnswered,
            StatusOfferQuestionnaireSent: person.statusOfferQuestionnaireSent,
            StatusOfferWillNotBeMade: person.statusOfferWillNotBeMade,
            StatusOnLeave: person.statusOnLeave,
            StatusResigned: person.statusResigned,
            teamIds: [team.id],
            ...Object.fromEntries(allTeamNames.map((name) => [name, ''])),
          };
        } else {
          personMap[person.personId].teamIds.push(team.id);
        }
        personMap[person.personId][teamColumnName] = 1;
      });
    });
    return Object.values(personMap);
  }, [apiDataCache]);



  const handleDownloadCSV = useCallback(() => {
    if (!flattenedData.length) return;

    const csv = jsonToCSV(flattenedData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'team_members.csv');
  }, [flattenedData]);
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
          <FilterPeopleTripleDot />
        </ActionBarItem>
      </ActionBarSection>
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
            Expand&nbsp;all
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
            Collapse&nbsp;all
          </SpanWithLinkStyle>
        </ActionBarItem>
      </ActionBarSection>
      <ActionBarSection>
        {viewerCanSeeOrDo(['canAddTeamMemberAnyTeam'], viewerAccessRights) && (
          <ActionBarItem>
            <SpanWithLinkStyle onClick={() => addTeamMemberClick()}>
              <PersonAddAltOutlinedStyled />
            </SpanWithLinkStyle>
          </ActionBarItem>
        )}
        {viewerCanSeeOrDo(['canAddTeam'], viewerAccessRights) && (
          <ActionBarItem>
            <SpanWithLinkStyle onClick={() => addTeamClick()}>
              Add&nbsp;team
            </SpanWithLinkStyle>
          </ActionBarItem>
        )}
      </ActionBarSection>
      <ActionBarSection>
        <ViewingCount>
          Viewing
          {' '}
          {visiblePeopleCount}
          {' '}
          {visiblePeopleCount === 1 ? 'person' : 'people'}
        </ViewingCount>
      </ActionBarSection>
      {viewerCanSeeOrDo(['canEditPersonAnyone'], viewerAccessRights) && (
        <ActionBarSection>
          <SpanWithLinkStyle onClick={handleDownloadCSV}>
            <DownloadStyled />
          </SpanWithLinkStyle>
        </ActionBarSection>
      )}
    </TeamsActionBarWrapper>
  );
};
TeamsActionBar.propTypes = {
};

const PersonAddAltOutlinedStyled = styled(PersonAddAltOutlined)`
  color: ${DesignTokenColors.primary500};
  cursor: pointer;
  margin-right: 2px;
  width: 18px;
  height: 18px;
`;

const TeamsActionBarWrapper = styled('div')`
  align-items: center;
  display: flex;
  justify-content: flex-start;
`;

const ViewingCount = styled('div')`
  color: ${DesignTokenColors.neutralUI400};
  font-size: .8em;
  padding-right: 15px;
  white-space: nowrap;
`;

const DownloadStyled = styled(Download)`
  color: ${DesignTokenColors.neutral200};
  font-size: 1.3em;
  padding-right: 15px;
`;

export default TeamsActionBar;
