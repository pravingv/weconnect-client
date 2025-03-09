import { Button, Checkbox, TextField } from '@mui/material';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';
import { MatchingPerson, SearchBarWrapper } from '../../components/Style/sharedStyles';
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

  const [peopleWorkingArray, setPeopleWorkingArray] = useState(); // Object.values(allPeopleCacheCopy1));
  const [updateCount, setUpdateCount] = useState(0);
  const [canEditPermissionsAnyone, setCanEditPermissionsAnyone] = useState(false);

  const searchByNameRef = useRef('');
  const searchByEmailRef = useRef('');

  useEffect(() => {
    setCanEditPermissionsAnyone(viewerCanSeeOrDo('canEditPermissionsAnyone', viewerAccessRights));
  }, [viewerAccessRights]);

  useEffect(() => {
    const allPeopleCacheCopy2 = JSON.parse(JSON.stringify(allPeopleCache));
    const sorted = alphabetizePeoplesObject(allPeopleCacheCopy2);
    setPeopleWorkingArray(sorted);
  }, [allPeopleCache]);

  const adminInputRef = useRef('');
  const hiringInputRef = useRef('');
  const leadInputRef = useRef('');
  const internInputRef = useRef('');
  const activeInputRef = useRef('');
  const leaveInputRef = useRef('');
  const resignedInputRef = useRef('');

  const SET = {
    ENABLE: true,
    DISABLE: false,
  };

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
    const activePerson = peopleWorkingArray.find((p) => parseInt(p.id) === personId);
    const personCached = Object.values(allPeopleCache).find((p) => p.id === personId);
    Object.assign(activePerson, personCached);
    setButtonState(SET.DISABLE, personId);
    setUpdateCount(updateCount + 1);  // setting array of arrays does not cause a re-render, due to nesting?
  };

  const saveClicked = (event) => {
    const personId = parseInt(event.target.id.split('-')[2]);
    const activePerson = peopleWorkingArray.find((p) => parseInt(p.id) === personId);
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
    console.log(event);
    // eslint-disable-next-line no-unused-vars
    if (canEditPermissionsAnyone) {
      const pieces = event.target.id.split('-');
      const personId = parseInt(pieces[2]);
      const person = peopleWorkingArray.find((p) => parseInt(p.id) === personId);
      switch (pieces[1]) {
        case 'admin':
          person.isAdmin = event.target.checked;
          break;
        case 'hiring':
          person.isHiringManager = event.target.checked;
          break;
        case 'lead':
          person.isTeamLead = event.target.checked;
          break;
        case 'intern':
          person.isIntern = event.target.checked;
          break;
        case 'active':
          person.statusActive = event.target.checked;
          break;
        case 'leave':
          person.statusOnLeave = event.target.checked;
          break;
        case 'resigned':
          person.statusResigned = event.target.checked;
          break;
        default:
          console.log('ERROR onClickCheckbox received invalid target id: ', event.target.id);
          return;
      }
      setButtonState(SET.ENABLE, personId);
      setUpdateCount(updateCount + 1);  // setting array of arrays does not cause a re-render, due to nesting?
      setPeopleWorkingArray(peopleWorkingArray);
    }
  };

  const searchFunction = () => {
    // As the list of staff persons grows, searching through the allPeopleCache, and even maintaining an allPeopleCache will require too much memory and bandwidth
    // Eventually we should send search queries to the server, and get just the people we are interested in
    // Probably there should be search limiter checkboxes like ... only get Active staff by default.
    // I don't want to build this out now, in case the UI team redesigns or eliminates this page
  };


  return (
    <PermissionsWrapper>
      <SearchBarWrapper>
        <TextField
          id="search_input"
          label="Search by name"
          inputRef={searchByNameRef}
          name="searchByName"
          onChange={searchFunction}
          placeholder="Search by name"
          defaultValue=""
          sx={{ minWidth: '200px', marginRight: '15px' }}
        />
        <TextField
          id="search_input"
          label="Search by email"
          inputRef={searchByEmailRef}
          name="searchByEmail"
          onChange={searchFunction}
          placeholder="Search by email"
          defaultValue=""
          sx={{ minWidth: '200px' }}
        />
        <MatchingPerson>Search is not yet implemented</MatchingPerson>
      </SearchBarWrapper>
      {!canEditPermissionsAnyone && (
        <ErrorText>
          These checkmarks are read-only since you do not have Admin privileges.
        </ErrorText>
      )}
      <table style={{ paddingTop: 20, borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <Th $cellwidth={300} style={{ textAlign: 'left' }}>Name</Th>
            <Th $cellwidth={150} style={{ textAlign: 'left' }}>Email</Th>
            <Th $cellwidth={25}>Admin</Th>
            <Th $cellwidth={25}>Hiring Manager</Th>
            <Th $cellwidth={25}>Lead</Th>
            <Th $cellwidth={25}>Intern</Th>
            <Th $cellwidth={25}>Active</Th>
            <Th $cellwidth={25}>Leave</Th>
            <Th $cellwidth={25}>Resigned</Th>
            <Th $cellwidth={25}>&nbsp;</Th>
            <Th $cellwidth={25}>&nbsp;</Th>
          </tr>
        </thead>
        <tbody>
          {peopleWorkingArray?.map((person) => (
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
  padding: 10px 10px 10px 0;
  min-width: ${(props) => (props.$cellwidth ? `${props.$cellwidth}px;` : ';')};
`;

const Td = styled.td`
  text-align: center
`;

export default withStyles(styles)(PermissionsAdministration);
