import { Button, Checkbox, TextField } from '@mui/material';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';
import { useConnectAppContext } from '../../contexts/ConnectAppContext';
import { viewerCanSeeOrDo } from '../../models/AuthModel';
import { getFullNamePreferredPerson } from '../../models/PersonModel';
import makeRequestParams from '../../react-query/makeRequestParams';
import { usePersonSaveMutation } from '../../react-query/mutations';
import { alphabetizePeoplesObject } from '../../utils/utilities';

/* global $  */


const PermissionsAdministration = ({ classes }) => {
  renderLog('PermissionsAdministration');

  const { mutate } = usePersonSaveMutation();
  const { apiDataCache } = useConnectAppContext();
  const { allPeopleCache, viewerAccessRights } = apiDataCache;

  const [peopleWorkingArray, setPeopleWorkingArray] = useState([]); // Object.values(allPeopleCacheCopy1));
  const [peopleWorkingArrayFiltered, setPeopleWorkingArrayFiltered] = useState([]); // Object.values(allPeopleCacheCopy1));
  const [updateCount, setUpdateCount] = useState(0);
  const [canEditPermissionsAnyone, setCanEditPermissionsAnyone] = useState(false);

  const searchByNameRef = useRef('');
  const filterState = useRef({});
  const onlyState = useRef({});
  const adminInputRef = useRef(undefined);
  const hrOfferAdminInputRef = useRef(undefined);
  const hrAdminInputRef = useRef(undefined);
  const hrGen1InputRef = useRef(undefined);
  const hrGen2InputRef = useRef(undefined);
  const hiringInputRef = useRef(undefined);
  const leadInputRef = useRef(undefined);
  const internInputRef = useRef(undefined);
  const activeInputRef = useRef(undefined);
  const leaveInputRef = useRef(undefined);
  const resignedInputRef = useRef(undefined);
  const specialInputRef = useRef(undefined);

  useEffect(() => {
    setCanEditPermissionsAnyone(viewerCanSeeOrDo(['canEditPermissionsAnyone'], viewerAccessRights));
  }, [viewerAccessRights]);

  const SET = {
    ENABLE: true,
    DISABLE: false,
  };

  const resetFilterButtons = () => {
    filterState.current.admin = true;
    filterState.current.hrOfferAdmin = true;
    filterState.current.hrAdmin = true;
    filterState.current.hrGen1 = true;
    filterState.current.hrGen2 = true;
    filterState.current.hiring = true;
    filterState.current.lead = true;
    filterState.current.intern = true;
    filterState.current.active = true;
    filterState.current.leave = false;       // Defaults to false, since it is rarely used
    filterState.current.resigned = false;    // Defaults to false, since it is rarely used
    filterState.current.special = false;     // Defaults to false, since it is rarely used
  };

  const resetOnlyButtons = () => {
    onlyState.current.admin = false;
    onlyState.current.hrOfferAdmin = false;
    onlyState.current.hrAdmin = false;
    onlyState.current.hrGen1 = false;
    onlyState.current.hrGen2 = false;
    onlyState.current.hiring = false;
    onlyState.current.lead = false;
    onlyState.current.intern = false;
    onlyState.current.active = false;
    onlyState.current.leave = false;
    onlyState.current.resigned = false;
    onlyState.current.special = false;
  };

  useEffect(() => {
    resetFilterButtons();
    resetOnlyButtons();
  }, []);


  const setStatusFieldsIfNotInitialized = (person) => {
    /* eslint-disable no-param-reassign */
    if (person.isAdmin === null) person.isAdmin = false;
    if (person.isHiringManager === null) person.isHiringManager = false;
    if (person.isIntern === null) person.isIntern = false;
    if (person.isTeamLead === null) person.isTeamLead = false;
    if (person.statusEmailCreated === null) person.statusEmailCreated = false;
    if (person.statusActive === null) person.statusActive = true;
    if (person.statusOfferLetterCreated === null) person.statusOfferLetterCreated = false;
    if (person.statusOfferLetterSigned === null) person.statusOfferLetterSigned = false;
    if (person.statusOnLeave === null) person.statusOnLeave = false;
    if (person.statusResigned === null) person.statusResigned = false;
    if (person.statusNonresponsive === null) person.statusNonresponsive = false;
    if (person.statusOfferApproved === null) person.statusOfferApproved = false;
    if (person.statusOfferWillNotBeMade === null) person.statusOfferWillNotBeMade = false;
    if (person.isHRAdmin === null) person.isHRAdmin = false;
    if (person.isHRGeneralist1 === null) person.isHRGeneralist1 = false;
    if (person.isHRGeneralist2 === null) person.isHRGeneralist2 = false;
    if (person.isHROfferAdmin === null) person.isHROfferAdmin = false;
    if (person.statusAvailableForSpecialProjects === null) person.statusAvailableForSpecialProjects = false;
    /* eslint-enable no-param-reassign */
  };


  const includePersonInFilteredArray = (person) => {
    const include = (person.isAdmin === true && filterState.current.admin === true) ||
      (person.isHROfferAdmin === true && filterState.current.hrOfferAdmin === true) ||
      (person.isHRAdmin === true && filterState.current.hrAdmin === true) ||
      (person.isHRGeneralist1 === true && filterState.current.hrGen1 === true) ||
      (person.isHRGeneralist2 === true && filterState.current.hrGen2 === true) ||
      (person.isHiringManager === true && filterState.current.hiring === true) ||
      (person.isTeamLead === true && filterState.current.lead === true) ||
      (person.isIntern === true && filterState.current.intern === true) ||
      (person.statusActive === true && filterState.current.active === true) ||
      (person.statusOnLeave === true && filterState.current.leave === true) ||
      (person.statusResigned === true && filterState.current.resigned === true) ||
      (person.statusAvailableForSpecialProjects === true && filterState.current.special === true);
    // Show them if none of the is/status are true, and all of the filterStates are true
    const zero = person.isAdmin === false && filterState.current.admin === true &&
      person.isHROfferAdmin === false && filterState.current.hrOfferAdmin === true &&
      person.isHRAdmin === false && filterState.current.hrAdmin === true &&
      person.isHRGeneralist1 === false && filterState.current.hrGen1 === true &&
      person.isHRGeneralist2 === false && filterState.current.hrGen2 === true &&
      person.isHiringManager === false && filterState.current.hiring === true &&
      person.isTeamLead === false && filterState.current.lead === true &&
      person.isIntern === false && filterState.current.intern === true &&
      person.statusActive === false && filterState.current.active === true &&
      person.statusOnLeave === false && filterState.current.leave === true &&
      person.statusResigned === false && filterState.current.resigned === true &&
      person.statusAvailableForSpecialProjects === false && filterState.current.special === true;

    return include || zero;
  };

  useEffect(() => {
    const allPeopleCacheCopy2 = JSON.parse(JSON.stringify(allPeopleCache));
    const sorted = alphabetizePeoplesObject(allPeopleCacheCopy2);
    sorted.forEach((person) => setStatusFieldsIfNotInitialized(person));
    setPeopleWorkingArray(sorted);
    setPeopleWorkingArrayFiltered(sorted.filter((person) => includePersonInFilteredArray(person)));
  }, [allPeopleCache]);

  const setButtonState = (set, personId) => {
    const saveButton = $(`#person-save-${personId}`);
    const cancelButton = $(`#person-cancel-${personId}`);
    if (set === SET.ENABLE) {
      saveButton.removeAttr('disabled').css('background-color', 'palegreen');
      cancelButton.removeAttr('disabled').css('background-color', 'palegreen');
    } else {
      saveButton.attr('disabled', 'disabled').css('background-color', 'inherit');
      cancelButton.attr('disabled', 'disabled').css('background-color', 'inherit');
    }
  };

  const cancelClicked  = (event) => {
    const pieces = event.target.id.split('-');
    const personId = parseInt(pieces[2]);
    const activePerson = peopleWorkingArrayFiltered.find((p) => parseInt(p.id) === personId);
    const personCached = Object.values(allPeopleCache).find((p) => p.id === personId);
    Object.assign(activePerson, personCached);
    setButtonState(SET.DISABLE, personId);
    setUpdateCount(updateCount + 1);  // setting array of arrays does not cause a re-render, due to nesting?
  };

  const saveClicked = (event) => {
    const personId = parseInt(event.target.id.split('-')[2]);
    const activePerson = peopleWorkingArrayFiltered.find((p) => parseInt(p.id) === personId);
    const personCached = Object.values(allPeopleCache).find((p) => parseInt(p.id) === personId);

    const data = {};
    Object.keys(activePerson).forEach((key) => {
      const initialValue = personCached[key]; // || ''; This "||" doesn't work for booleans since it forces a 'false' to become ''
      const activeValue = activePerson[key];  //  || '';    and then doesn't send the 'false' to the server for the data update.
      if (initialValue !== activeValue) {
        data[key] = activeValue;
      }
    });
    const plainParams = {
      personId: activePerson.id,
    };

    mutate(makeRequestParams(plainParams, data));
    console.log('Saved person: ', activePerson.id);
    setTimeout(() => {
      setButtonState(SET.DISABLE, personId);
      setUpdateCount(updateCount + 1);  // setting array of arrays does not cause a re-render, due to nesting?
    }, 1500);
  };

  const onClickCheckbox = (event) => {
    // console.log(event);
    // eslint-disable-next-line no-unused-vars
    if (canEditPermissionsAnyone) {
      const pieces = event.target.id.split('-');
      const personId = parseInt(pieces[2]);
      const person = peopleWorkingArrayFiltered.find((p) => parseInt(p.id) === personId);
      switch (pieces[1]) {
        case 'admin':        person.isAdmin = event.target.checked; break;
        case 'hradmin':      person.isHRAdmin = event.target.checked; break;
        case 'hrofferadmin': person.isHROfferAdmin = event.target.checked; break;
        case 'hrgen1':       person.isHRGeneralist1 = event.target.checked; break;
        case 'hrgen2':       person.isHRGeneralist2 = event.target.checked; break;
        case 'hiring':       person.isHiringManager = event.target.checked; break;
        case 'lead':         person.isTeamLead = event.target.checked; break;
        case 'intern':       person.isIntern = event.target.checked; break;
        case 'active':       person.statusActive = event.target.checked; break;
        case 'leave':        person.statusOnLeave = event.target.checked; break;
        case 'resigned':     person.statusResigned = event.target.checked; break;
        case 'special':      person.statusAvailableForSpecialProjects = event.target.checked; break;
        default:
          console.log('ERROR onClickCheckbox received invalid target id: ', event.target.id);
          return;
      }
      setButtonState(SET.ENABLE, personId);
      setUpdateCount(updateCount + 1);  // setting array of arrays does not cause a re-render, due to nesting?
      setPeopleWorkingArrayFiltered(peopleWorkingArrayFiltered);  // Does this do anything???????
    }
  };

  const showAll  = () => {
    resetFilterButtons();
    resetOnlyButtons();
    filterState.current.leave = true;
    filterState.current.resigned = true;
    filterState.current.special = true;
    const allPeopleCacheCopy2 = JSON.parse(JSON.stringify(allPeopleCache));
    const sorted = alphabetizePeoplesObject(allPeopleCacheCopy2);
    sorted.forEach((person) => setStatusFieldsIfNotInitialized(person));
    setPeopleWorkingArray(sorted);
    setPeopleWorkingArrayFiltered(sorted.filter((person) => includePersonInFilteredArray(person)));
  };

  const searchAndFilterFunction = (event) => {
    let { id } = event.currentTarget;
    if (id.includes('Filter')) {
      // Update filterState array
      id = id.replace('Filter', '');
      const element = Object.entries(filterState.current).find((key) => key[0] === id);
      filterState.current[element[0]] = !element[1];
      resetOnlyButtons();
    } else if (id.includes('Only')) {
      id = id.replace('Only', '');
      Object.keys(onlyState.current).forEach((key) => {
        if (key === id) {
          // key for the 'only' button that was clicked
          if (onlyState.current[key]) {
            // If the button is already selected, then we are deselecting
            onlyState.current[key] = false;
            resetFilterButtons();
            resetOnlyButtons();
          } else {
            // The clicked button is not already selected
            Object.keys(filterState.current).forEach((keySelect) => {
              // Iterate through all the filter state buttons, and make them match the
              filterState.current[keySelect] = keySelect === id;
              onlyState.current[keySelect] = keySelect === id;
            });
          }
        }
      });
      console.log('only filter clicked: ', id);
    }
    // Remove any search limiting from the dataset, but re-add the column filtering
    const filteredPeople = peopleWorkingArray.filter((person) => includePersonInFilteredArray(person));
    const srch = searchByNameRef.current.value;
    if (srch.length > 0) {
      const filteredSearchedPeople =
        filteredPeople.filter((person) => getFullNamePreferredPerson(person).toLowerCase().includes(srch.toLowerCase()));
      setPeopleWorkingArrayFiltered(filteredSearchedPeople);
    } else {
      setPeopleWorkingArrayFiltered(filteredPeople);
    }
  };

  const TableHeaderButton = (params) => {
    const { id, text } = params;
    const filterStateKey = id.replace('Filter', '');
    return (
      <Th $cellwidth={25} $padding={false}>
        <div style={{ marginBottom: '4px' }}>
          <FilterButton
            variant="outlined"
            id={id}
            size="small"
            onClick={searchAndFilterFunction}
            $colorChoice={filterState.current[filterStateKey]}
          >
            {text}
          </FilterButton>
        </div>
        <OnlyButton
          variant="outlined"
          id={`${filterStateKey}Only`}
          size="small"
          onClick={searchAndFilterFunction}
          $colorChoice={onlyState.current[filterStateKey]}
        >
          Only
        </OnlyButton>
      </Th>
    );
  };

  return (
    <PermissionsWrapper>
      <PermissionsSearchBarWrapper>
        <TextField
          id="search_input"
          label="Search by name"
          inputRef={searchByNameRef}
          name="searchByName"
          onChange={searchAndFilterFunction}
          placeholder="Search by name"
          defaultValue=""
          sx={{ minWidth: '200px', marginRight: '15px' }}
        />
        <span style={{ paddingTop: '33px', color: 'gray' }}>Note: &apos;Leave&apos;, &apos;Resigned&apos;, and &apos;Special Projects&apos; default to off</span>
      </PermissionsSearchBarWrapper>
      {!canEditPermissionsAnyone && (
        <ErrorText>
          These checkmarks are read-only since you do not have Admin privileges.
        </ErrorText>
      )}
      <table style={{ paddingTop: 20, borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <Th $cellwidth={250} style={{ textAlign: 'left' }}>Name</Th>
            <Th $cellwidth={320} style={{ textAlign: 'left' }}>Email</Th>
            <TableHeaderButton id="adminFilter" text="Admin" />
            <TableHeaderButton id="hrAdminFilter" text="HR Admin" />
            <TableHeaderButton id="hrOfferAdminFilter" text="HR Offer Admin" />
            <TableHeaderButton id="hrGen1Filter" text="HR Gen 1" />
            <TableHeaderButton id="hrGen2Filter" text="HR Gen 2" />
            <TableHeaderButton id="hiringFilter" text="Hiring Manager" />
            <TableHeaderButton id="leadFilter" text="Lead" />
            <TableHeaderButton id="internFilter" text="Intern" />
            <TableHeaderButton id="activeFilter" text="Active" />
            <TableHeaderButton id="leaveFilter" text="Leave" />
            <TableHeaderButton id="resignedFilter" text="Resigned" />
            <TableHeaderButton id="specialFilter" text="Special Projects" />
            <Th $cellwidth={25}>
              <div style={{ width: '100px' }}>
                {peopleWorkingArrayFiltered?.length} Staff
              </div>
              <Button
                variant="outlined"
                id="AllButton"
                size="small"
                onClick={showAll}
                $colorChoice
                sx={{ transform: 'translate(0,114%)' }}
              >
                Show All
              </Button>
            </Th>
            <Th $cellwidth={25} />
          </tr>
        </thead>
        <tbody>
          {peopleWorkingArrayFiltered?.map((person) => (
            <Tr key={person.id}>
              <td style={{ paddingRight: 20, fontWeight: 500 }}>{getFullNamePreferredPerson(person)}</td>
              <td style={{ paddingRight: 20 }}>{person.emailPersonal}</td>
              <Td>
                <Checkbox
                  checked={person.isAdmin}
                  className={classes.checkboxDoneRoot}
                  color="primary"
                  id={`checkbox-admin-${person.id}`}
                  inputRef={adminInputRef}
                  onChange={onClickCheckbox}
                />
              </Td>
              <Td>
                <Checkbox
                  checked={person.isHRAdmin}
                  className={classes.checkboxDoneRoot}
                  color="primary"
                  id={`checkbox-hradmin-${person.id}`}
                  inputRef={hrAdminInputRef}
                  onChange={onClickCheckbox}
                />
              </Td>
              <Td>
                <Checkbox
                  checked={person.isHROfferAdmin}
                  className={classes.checkboxDoneRoot}
                  color="primary"
                  id={`checkbox-hrofferadmin-${person.id}`}
                  inputRef={hrOfferAdminInputRef}
                  onChange={onClickCheckbox}
                />
              </Td>
              <Td>
                <Checkbox
                  checked={person.isHRGeneralist1}
                  className={classes.checkboxDoneRoot}
                  color="primary"
                  id={`checkbox-hrgen1-${person.id}`}
                  inputRef={hrGen1InputRef}
                  onChange={onClickCheckbox}
                />
              </Td>
              <Td>
                <Checkbox
                  checked={person.isHRGeneralist2}
                  className={classes.checkboxDoneRoot}
                  color="primary"
                  id={`checkbox-hrgen2-${person.id}`}
                  inputRef={hrGen2InputRef}
                  onChange={onClickCheckbox}
                />
              </Td>
              <Td>
                <Checkbox
                  checked={person.isHiringManager}
                  className={classes.checkboxDoneRoot}
                  color="primary"
                  id={`checkbox-hiring-${person.id}`}
                  inputRef={hiringInputRef}
                  inputProps={{ 'aria-label': 'controlled' }}
                  onChange={onClickCheckbox}
                />
              </Td>
              <Td>
                <Checkbox
                  checked={person.isTeamLead}
                  className={classes.checkboxDoneRoot}
                  color="primary"
                  id={`checkbox-lead-${person.id}`}
                  inputRef={leadInputRef}
                  onChange={onClickCheckbox}
                />
              </Td>
              <Td>
                <Checkbox
                  checked={person.isIntern}
                  className={classes.checkboxDoneRoot}
                  color="primary"
                  id={`checkbox-intern-${person.id}`}
                  inputRef={internInputRef}
                  onChange={onClickCheckbox}
                />
              </Td>
              <Td>
                <Checkbox
                  checked={person.statusActive}
                  className={classes.checkboxDoneRoot}
                  color="primary"
                  id={`checkbox-active-${person.id}`}
                  inputRef={activeInputRef}
                  name="activeCheckBox"
                  onChange={onClickCheckbox}
                />
              </Td>
              <Td>
                <Checkbox
                  checked={person.statusOnLeave}
                  className={classes.checkboxDoneRoot}
                  color="primary"
                  id={`checkbox-leave-${person.id}`}
                  inputRef={leaveInputRef}
                  onChange={onClickCheckbox}
                />
              </Td>
              <Td>
                <Checkbox
                  checked={person.statusResigned}
                  className={classes.checkboxDoneRoot}
                  color="primary"
                  id={`checkbox-resigned-${person.id}`}
                  inputRef={resignedInputRef}
                  // sx={{ display: 'block', margin: 'auto' }}
                  onChange={onClickCheckbox}
                />
              </Td>
              <Td>
                <Checkbox
                  checked={person.statusAvailableForSpecialProjects}
                  className={classes.checkboxDoneRoot}
                  color="primary"
                  id={`checkbox-special-${person.id}`}
                  inputRef={specialInputRef}
                  onChange={onClickCheckbox}
                />
              </Td>
              <Td>
                {canEditPermissionsAnyone && (
                  <Button id={`person-save-${person.id}`} size="small" onClick={saveClicked}>Save</Button>
                )}
              </Td>
              <Td>
                {canEditPermissionsAnyone && (
                  <Button id={`person-cancel-${person.id}`} size="small" onClick={cancelClicked}>Cancel</Button>
                )}
              </Td>
            </Tr>
          ))}
        </tbody>
      </table>

    </PermissionsWrapper>
  );
};
PermissionsAdministration.propTypes = {
  classes: PropTypes.object.isRequired,
};

const styles = () => ({
  checkboxDoneRoot: {
    marginLeft: '-10px',
    paddingTop: 0,
    paddingBottom: 0,
  },
  checkboxRoot: {
    paddingTop: 0,
    paddingLeft: '9px',
    paddingBottom: 0,
  },
  checkboxLabel: {
    marginLeft: '-6px',
    marginTop: 2,
  },
});

const ErrorText = styled('div')`
  width: fit-content;
  font-style: italic;
  background-color: yellow;
  padding: 2px;
  margin-top: 25px;
`;

const PermissionsWrapper = styled('div')`
  margin-left: 15px;
`;

const Tr = styled.tr`
  &:nth-child(even) {
    border-bottom: 1px solid lightblue;
  }
`;

const Th = styled.th`
  padding: ${(props) => (props.$padding ? '10px 10px 10px 0' : '')};
  min-width: ${(props) => (props.$cellwidth ? `${props.$cellwidth}px;` : ';')};
`;

const Td = styled.td`
  text-align: center
`;

const FilterButton = styled(Button)`
  height: 100px;
  display: flex;
  align-items: center;
  margin-right: 2px;
  color: ${(props) => (props.$colorChoice ? '#206DB3;' : 'grey')};
`;

const OnlyButton = styled(Button)`
  color: ${(props) => (props.$colorChoice ? '#206DB3;' : 'grey')};
`;

const PermissionsSearchBarWrapper = styled('div')`
  vertical-align:top;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
`;

export default withStyles(styles)(PermissionsAdministration);
