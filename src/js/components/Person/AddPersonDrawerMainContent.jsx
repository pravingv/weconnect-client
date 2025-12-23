import { TextField } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import arrayContains from '../../common/utils/arrayContains';
import { renderLog } from '../../common/utils/logging';
import { useConnectAppContext } from '../../contexts/ConnectAppContext';
import { getTeamMemberPersonListByTeamId } from '../../models/TeamModel';
import makeRequestParams from '../../react-query/makeRequestParams';
import { useAddPersonToTeamMutation } from '../../react-query/mutations';
import {
  alphabetizePeoplesObject,
  filterNamesWithDEPRICATEKey,
  orderListByFurthestFutureStartDate,
  sortByNoTeamFirst,
} from '../../utils/utilities';
import { SpanWithLinkStyle } from '../Style/linkStyles';
import { MatchingPerson, SearchBarWrapper } from '../Style/sharedStyles';
import AddPersonForm from './AddPersonForm';
import CrossIcon from '../../../img/global/svg-icons/cross.svg';

const LIMIT_NUMBER_SHOWN = 20;


const AddPersonDrawerMainContent = () => {
  renderLog('AddPersonDrawerMainContent');
  const { apiDataCache, getAppContextValue } = useConnectAppContext();
  const { allPeopleCache, allTeamsCache, allPeopleTeamIdLists } = apiDataCache;
  const { mutate: addPersonToTeam } = useAddPersonToTeamMutation();

  // const params  = useParams();
  // console.log('AddPersonDrawerMainContent params: ', params);

  const [addToTeamList, setAddToTeamList] = useState([]);
  const [allPeopleList, setAllPeopleList] = useState([]);
  const [remainingPeopleToAdd, setRemainingPeopleToAdd] = useState([]);
  const [searchResultsList, setSearchResultsList] = useState(undefined);
  const [thisTeamsCurrentMembersList, setThisTeamsCurrentMembersList] = useState([]);
  const [team] = useState(getAppContextValue('addPersonDrawerTeam'));
  const [teamMemberPersonIdList] = useState([]);
  const [matchingCountText, setMatchingCountText] = useState('');

  const searchStringInputRef = useRef(null);

  const updateRemainingPeopleToAdd = () => {
    // console.log('initializeTheRemainingPeopleToAddListList in AddPersonDrawerMainContent');
    // Start with the passed in allPeopleList, create the remainingPeopleToAddList, by removing any people already on the team
    if (allPeopleList && allPeopleList.length > 0 && thisTeamsCurrentMembersList && thisTeamsCurrentMembersList.length >= 0) {
      const remainingPeopleToAddTemp = [];
      allPeopleList.forEach((onePerson) => {
        const isOnTeam = thisTeamsCurrentMembersList.some((obj) => obj.id === onePerson.personId);
        if (!isOnTeam) {
          remainingPeopleToAddTemp.push(onePerson);
        }
      });
      setRemainingPeopleToAdd(remainingPeopleToAddTemp);
    }
  };

  useEffect(() => {
    setAllPeopleList(Object.values(allPeopleCache));
  }, [allPeopleCache]);

  useEffect(() => {
    const teamId = team ? team.teamId : -1;
    if (teamId >= 0) {
      const teamMembersListTemp = getTeamMemberPersonListByTeamId(teamId, apiDataCache);
      // console.log('useEffect in AddPersonDrawerMainContent teamMembersListTemp:', teamMembersListTemp);
      setThisTeamsCurrentMembersList(teamMembersListTemp);
    } else {
      console.log('useEffect in AddPersonDrawerMainContent teamId is -1, so no teamId');
    }
  }, [allPeopleCache, allPeopleList, allTeamsCache, apiDataCache, team]);

  useEffect(() => {
    updateRemainingPeopleToAdd();
  }, [thisTeamsCurrentMembersList]);

  useEffect(() => {
    let addToTeamListTemp = searchResultsList || remainingPeopleToAdd || [];
    addToTeamListTemp = sortByNoTeamFirst(addToTeamListTemp, allPeopleTeamIdLists);
    addToTeamListTemp = orderListByFurthestFutureStartDate(addToTeamListTemp);
    addToTeamListTemp = filterNamesWithDEPRICATEKey(addToTeamListTemp);
    addToTeamListTemp = addToTeamListTemp.filter((person) => (person.statusActive !== false) && (person.statusResigned !== true)).slice(0, LIMIT_NUMBER_SHOWN);
    addToTeamListTemp = alphabetizePeoplesObject(addToTeamListTemp, true);
    setAddToTeamList(addToTeamListTemp);
  }, [searchResultsList, remainingPeopleToAdd]);

  useEffect(() => {
    // console.log('== INITIAL useEffect in AddPersonDrawerMainContent');
    if (allPeopleCache) {
      setAllPeopleList(Object.values(allPeopleCache));
    }
  }, []);

  const setMatchingCounter = (matchingElements) => {
    const matchingCount = matchingElements.length === 0 ? '' : `${matchingElements.length} matches out of ${remainingPeopleToAdd.length} people`;
    setMatchingCountText(matchingCount);
  };

  const searchFunction = () => {   // Now searches first and last name
    const currentValue = searchStringInputRef.current.value;
    if (currentValue.length === 0) {
      setMatchingCountText('');
      setSearchResultsList(undefined);
    } else {
      const isMatch = (element) => (element.lastName.toLowerCase().includes(currentValue.toLowerCase()) ||
          element.firstName.toLowerCase().includes(currentValue.toLowerCase()) || element.firstNamePreferred?.toLowerCase().includes(currentValue.toLowerCase()));
      const matchingElements = remainingPeopleToAdd ? remainingPeopleToAdd.filter((element) => isMatch(element)) : {};
      if (matchingElements && matchingElements.length) {
        setSearchResultsList(matchingElements);
        setMatchingCounter(matchingElements);
        // console.log(matchingElements);
      } else {
        setMatchingCountText('');
      }
    }
  };

  const clearSearch = () => {
    searchStringInputRef.current.value = '';
    setSearchResultsList(undefined);
    setMatchingCountText('');
  };

  const addClicked = (incomingPerson) => {
    const personId = incomingPerson ? incomingPerson.personId : -1;
    const teamId = team ? team.teamId : -1;
    const teamName = team ? team.teamName : '';
    const plainParams = {
      personId,
      teamId,
    };
    addPersonToTeam(makeRequestParams(plainParams, {
      teamMemberFirstName: incomingPerson.firstName,
      teamMemberLastName: incomingPerson.lastName,
      teamName,
    }));
    // Remove this person from the All People less Adds list (since they were added to the team)

    const updatedRemainingPeopleToAdd = remainingPeopleToAdd.filter((person) => person.personId !== incomingPerson.personId);
    setRemainingPeopleToAdd(updatedRemainingPeopleToAdd);
    if (searchResultsList && searchResultsList.length >= 0) {
      // also remove them from the searchResultsList if it exists
      const updatedSearchResultsList = searchResultsList.filter((person) => person.personId !== incomingPerson.personId);
      setSearchResultsList(updatedSearchResultsList);
      setMatchingCounter(updatedSearchResultsList);
    }
  };

  return (
    <AddPersonDrawerMainContentWrapper>
      {team && team.teamId >= 0 && (
        <SearchBarWrapper>
          <TextField
            id="search_input"
            label="Search for team members"
            inputRef={searchStringInputRef}
            name="searchByName"
            onChange={searchFunction}
            placeholder="Search by name"
            defaultValue=""
            sx={{ minWidth: '250px' }}
            InputProps={{
              endAdornment: searchStringInputRef.current?.value ? (
                <span
                  onClick={clearSearch}
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <img src={CrossIcon} alt="Clear search" style={{ width: 14, height: 14 }} />
                </span>
              ) : null,
            }}
          />
          <MatchingPerson>{matchingCountText}</MatchingPerson>
        </SearchBarWrapper>
      )}
      {(addToTeamList && addToTeamList.length > 0) && (
        <PersonSearchResultsWrapper>
          <PersonListTitle>{ searchResultsList ? 'Filtered list of people to add to team: ' : `Can be added to team (top ${LIMIT_NUMBER_SHOWN}): `}</PersonListTitle>
          <PersonList>
            {addToTeamList.map((person) => (
              <PersonItem key={`personResult-${person.id}`}>
                {person.firstName}
                {' '}
                {person.lastName}
                {!arrayContains(person.id, teamMemberPersonIdList) && (
                  <>
                    {' '}
                    <SpanWithLinkStyle onClick={() => addClicked(person)}>add</SpanWithLinkStyle>
                  </>
                )}
              </PersonItem>
            ))}
          </PersonList>
        </PersonSearchResultsWrapper>
      )}

      <AddPersonWrapper>
        <AddPersonForm />
      </AddPersonWrapper>
    </AddPersonDrawerMainContentWrapper>
  );
};

const AddPersonDrawerMainContentWrapper = styled('div')`
  min-width: 30px;
`;

const AddPersonWrapper = styled('div')`
  margin-top: 16px;
`;

const PersonItem = styled('div')`
`;

const PersonList = styled('div')`
`;

const PersonListTitle = styled('div')`
  font-weight: 250;
`;

const PersonSearchResultsWrapper = styled('div')`
`;

export default AddPersonDrawerMainContent;
