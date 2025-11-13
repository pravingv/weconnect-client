import { MoreHoriz } from '@mui/icons-material';
import Popover from '@mui/material/Popover';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import styled from 'styled-components';
import DesignTokenColors from '../../common/components/Style/DesignTokenColors';
import { renderLog } from '../../common/utils/logging';
import { useConnectAppContext } from '../../contexts/ConnectAppContext';
import { useAddPersonToTeamMutation, useRemoveTeamMemberMutation } from '../../react-query/mutations';
import { viewerCanSeeOrDo, viewerCanSeeOrDoForThisTeam } from '../../models/AuthModel';
import makeRequestParams from '../../react-query/makeRequestParams';
import { getTeamMemberEntryByPersonIdAndTeamId } from '../../models/TeamModel';


const PersonSummaryRowTripleDot = ({ person, teamId }) => {
  renderLog('PersonSummaryRowTripleDot');  // Set LOG_RENDER_EVENTS to log all renders
  const { apiDataCache, setAppContextValue } = useConnectAppContext();
  const { viewerAccessRights, viewerTeamAccessRights } = apiDataCache;
  const { mutate: addPersonToTeam } = useAddPersonToTeamMutation();
  const { mutate: removeTeamMember } = useRemoveTeamMemberMutation();

  const [anchorEl, setAnchorEl] = useState(null);

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const addTeamLeadClick = () => {
    handlePopoverClose();
    const plainParams = {
      personId: person.personId,
      teamId,
    };
    addPersonToTeam(makeRequestParams(plainParams, {
      isTeamLead: true,
    }));
  };

  const removeTeamLeadClick = () => {
    handlePopoverClose();
    const plainParams = {
      personId: person.personId,
      teamId,
    };
    addPersonToTeam(makeRequestParams(plainParams, {
      isTeamLead: false,
    }));
  };

  const removeTeamMemberClick = () => {
    handlePopoverClose();
    const params = { personId: person.personId, teamId };
    removeTeamMember(params);
  };

  // const editPersonClick = (hasEditRights = true) => {
  //   if (hasEditRights) {
  //     setAppContextValue('headerProfileDrawerOpen', true);
  //     setAppContextValue('profileDrawerPerson', person);
  //     setAppContextValue('profileDrawerPersonId', person.personId);
  //   }
  // };

  const editPersonTasksClick = (hasEditRights = true) => {
    if (hasEditRights) {
      handlePopoverClose();
      setAppContextValue('headerProfileDrawerOpen', true);
      setAppContextValue('headerProfileSection', 'personTasks');
      setAppContextValue('profileDrawerPerson', person);
      setAppContextValue('profileDrawerPersonId', person.personId);
    }
  };

  const onDotButtonClick = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const personProfileClick = () => {
    handlePopoverClose();
    setAppContextValue('headerProfileDrawerOpen', true);
    setAppContextValue('headerProfileSection', 'visibleProfile');
    setAppContextValue('profileDrawerPerson', person);
    setAppContextValue('profileDrawerPersonId', person.personId);
  };

  const canEditPerson = viewerCanSeeOrDo(['canEditPersonAnyone'], viewerAccessRights) || viewerCanSeeOrDoForThisTeam('canEditPersonThisTeam', teamId, viewerTeamAccessRights);
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;
  const teamMember = getTeamMemberEntryByPersonIdAndTeamId(person.id, teamId, apiDataCache);
  const isTeamLead = teamMember && teamMember.isTeamLead;
  return (
    <PersonSummaryRowTripleDotWrapper>
      <TripleDotButton type="button" aria-label="source" onClick={onDotButtonClick}>
        <MoreHoriz />
      </TripleDotButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <PopoverWrapper>
          <PopoverNameAndMessageText>
            <StyledTypography onClick={() => personProfileClick()}>
              View
              {' '}
              {person.firstNamePreferred || person.firstName || 'person'}
              &apos;s
              {' '}
              profile
            </StyledTypography>
          </PopoverNameAndMessageText>
          {canEditPerson && (
            <PopoverTasks>
              <StyledTypography onClick={() => editPersonTasksClick(true)}>
                Onboarding tasks
              </StyledTypography>
            </PopoverTasks>
          )}
          {(teamId > 0 && viewerCanSeeOrDo(['canAddTeamMemberAnyTeam'], viewerAccessRights)) && (
            <PopoverViewDetailsText>
              {isTeamLead ? (
                <StyledTypography onClick={() => removeTeamLeadClick(person)}>
                  Remove
                  {' '}
                  {person.firstNamePreferred || person.firstName || ''}
                  {' '}
                  as team lead
                </StyledTypography>
              ) : (
                <StyledTypography onClick={() => addTeamLeadClick(person)}>
                  Add
                  {' '}
                  {person.firstNamePreferred || person.firstName || ''}
                  {' '}
                  as team lead
                </StyledTypography>
              )}
            </PopoverViewDetailsText>
          )}
          {(teamId > 0 && (viewerCanSeeOrDo(['canAddTeamMemberAnyTeam'], viewerAccessRights) || viewerCanSeeOrDo(['canRemoveTeamMemberAnyTeam'], viewerAccessRights))) && (
            <PopoverViewDetailsText>
              <StyledTypography onClick={() => removeTeamMemberClick(person)}>
                Remove
                {' '}
                {person.firstNamePreferred || person.firstName || ''}
                {' '}
                from this team
              </StyledTypography>
            </PopoverViewDetailsText>
          )}
        </PopoverWrapper>
      </Popover>
    </PersonSummaryRowTripleDotWrapper>
  );
};
PersonSummaryRowTripleDot.propTypes = {
  person: PropTypes.object.isRequired,
  teamId: PropTypes.number,
};

const styles = (theme) => ({
  addTeamButtonRoot: {
    width: 120,
    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
  },
});

const PersonSummaryRowTripleDotWrapper = styled('div')`
  padding: 0 8px;
  color: ${DesignTokenColors.neutral900};
  :hover {
    color: ${DesignTokenColors.neutral400};
    cursor: pointer;
  }
`;

const PopoverWrapper = styled('div')`
  padding: 5px;
`;

const PopoverNameAndMessageText = styled('div')`
  padding: 6px;
`;

const PopoverTasks = styled('div')`
  padding: 6px;
`;

const PopoverViewDetailsText = styled('div')`
  padding: 6px;
  cursor: pointer;
`;

const StyledTypography = styled('div')`
  font-size: 12px;
  cursor: pointer;
`;

const TripleDotButton = styled('button')`
  background: transparent;
  border: 0;
  margin-right: -3px;
  margin-top: 6px;
  padding: 0;
`;

export default withStyles(styles)(PersonSummaryRowTripleDot);
