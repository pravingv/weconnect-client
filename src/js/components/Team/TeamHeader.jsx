import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';
import { useConnectAppContext } from '../../contexts/ConnectAppContext';
import { viewerCanSeeOrDo } from '../../models/AuthModel';
import { EditStyled } from '../Style/iconStyles';
import TeamMemberList from './TeamMemberList';
import { ActionBarItem, ActionBarSection } from '../Style/actionBarStyles';
import { SpanWithLinkStyle } from '../Style/linkStyles';


const TeamHeader = ({ expandAllTeamMembersFromParent, hideInactiveFromParent, searchText, showAllTeamMembersFromParent, showIcons, team }) => {
  renderLog('TeamHeader');
  const { apiDataCache, getAppContextValue, setAppContextValue } = useConnectAppContext();
  const { viewerAccessRights } = apiDataCache;

  const [expandAllTeamMembers, setExpandAllTeamMembers] = useState(expandAllTeamMembersFromParent);
  const [hideInactive, setHideInactive] = useState(hideInactiveFromParent);
  const [showAllTeamMembers, setShowAllTeamMembers] = useState(showAllTeamMembersFromParent);
  const [showAllTeamMembersFromParentAlreadySet, setShowAllTeamMembersFromParentAlreadySet] = useState(showAllTeamMembersFromParent);
  let teamLocal = team;
  if (!teamLocal || !teamLocal.teamName) {
    teamLocal = getAppContextValue('teamForAddTeamDrawer');
  }

  const addTeamMemberClick = () => {
    // console.log('TeamHome addTeamMemberClick, teamId:', teamId);
    setAppContextValue('addPersonDrawerOpen', true);
    setAppContextValue('AddPersonDrawerLabel', 'Add Team Member');
    setAppContextValue('addPersonDrawerTeam', team);
  };

  const editTeamClick = () => {
    // console.log('editTeamClick: ', teamLocal);
    setAppContextValue('addTeamDrawerOpen', true);
    setAppContextValue('AddTeamDrawerLabel', 'Edit Team Name');
    setAppContextValue('teamForAddTeamDrawer', teamLocal);
  };

  // eslint-disable-next-line no-unused-vars
  const hideInactiveClick = () => {
    setHideInactive(!hideInactive);
  };

  useEffect(() => {
    if (showAllTeamMembersFromParent !== showAllTeamMembersFromParentAlreadySet) {
      setShowAllTeamMembers(showAllTeamMembersFromParent);
      setShowAllTeamMembersFromParentAlreadySet(showAllTeamMembersFromParent);
    }
  }, [showAllTeamMembers, showAllTeamMembersFromParent, showAllTeamMembersFromParentAlreadySet]);

  // console.log('TeamHeader teamLocal.teamName ', teamLocal.teamName);
  return (
    <OneTeamOuterWrapper>
      <OneTeamHeaderOuterWrapper>
        <TeamHeaderMainRow>
          <TeamHeaderCell
            onClick={() => setShowAllTeamMembers(!showAllTeamMembers)}
            $cellwidth={25}
            $titlecell
          >
            {showAllTeamMembers ? (
              <KeyboardArrowUpStyled />
            ) : (
              <KeyboardArrowDownStyled />
            )}
          </TeamHeaderCell>
          <TeamHeaderCell $cellwidth={215} $largefont $titlecell>
            {teamLocal && (
              <Link to={`/team-home/${teamLocal.id}`}>
                {teamLocal.teamName}
              </Link>
            )}
          </TeamHeaderCell>
          <ActionBarSection>
            {showAllTeamMembers && (
              <ActionBarItem>
                <SpanWithLinkStyle onClick={() => setExpandAllTeamMembers(!expandAllTeamMembers)}>
                  {expandAllTeamMembers ? 'Collapse all' : 'Expand all'}
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
          {/* Edit icon */}
          {showIcons && (
            <>
              {viewerCanSeeOrDo(['canEditTeamAnyTeam'], viewerAccessRights) && (
                <TeamHeaderCell $cellwidth={20} onClick={editTeamClick} $titleCell>
                  <EditStyled />
                </TeamHeaderCell>
              )}
            </>
          )}
        </TeamHeaderMainRow>
        {showAllTeamMembers && (
          <TeamHeaderPersonColumnTitles>
            {/* Please leave cellwidth values as-is unless you are also modifying PersonSummaryRow */}
            <TeamHeaderCell $cellwidth={20} />
            <TeamHeaderCell $cellwidth={25} />
            <TeamHeaderCell $cellwidth={180}>
              Name
            </TeamHeaderCell>
            <TeamHeaderCell $cellwidth={150}>
              Location
            </TeamHeaderCell>
            <TeamHeaderCell $cellwidth={200}>
              Title
            </TeamHeaderCell>
            <TeamHeaderCell $cellwidth={150} />
            <TeamHeaderCell $cellwidth={100} $rightAlign>
              Volunteer for
            </TeamHeaderCell>
          </TeamHeaderPersonColumnTitles>
        )}
      </OneTeamHeaderOuterWrapper>
      {showAllTeamMembers && (
        <>
          {/* DO NOT REMOVE PASSED IN team */}
          <TeamMemberList
            expandAllTeamMembers={expandAllTeamMembers}
            hideInactive={hideInactive}
            searchText={searchText}
            team={team}
            teamId={team.id}
          />
        </>
      )}
    </OneTeamOuterWrapper>
  );
};
TeamHeader.propTypes = {
  hideInactiveFromParent: PropTypes.bool,
  searchText: PropTypes.string,
  showIcons: PropTypes.bool,
  showAllTeamMembersFromParent: PropTypes.bool,
  team: PropTypes.object,
};

const styles = (theme) => ({
  ballotButtonIconRoot: {
    marginRight: 8,
  },
  addTeamButtonRoot: {
    width: 120,
    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
  },
});

const KeyboardArrowDownStyled = styled(KeyboardArrowDown)`
`;

const KeyboardArrowUpStyled = styled(KeyboardArrowUp)`
`;

const OneTeamHeaderOuterWrapper = styled('div')`
`;

const OneTeamOuterWrapper = styled('div')`
`;

const TeamHeaderMainRow = styled('div')`
  align-items: center;
  display: flex;
  justify-content: flex-start;
  margin-top: 10px;
`;

const TeamHeaderPersonColumnTitles = styled('div')`
  align-items: center;
  display: flex;
  justify-content: flex-start;
  margin-top: 10px;
`;

const TeamHeaderCell = styled.div`
  align-content: center;
  border-bottom: ${(props) => (props?.$titleCell ? ';' : '1px solid #ccc;')}
  ${(props) => (props.$rightAlign ? 'display: flex;' : '')};
  ${(props) => (props.$rightAlign ? 'justify-content: flex-end;' : '')};
  font-size: ${(props) => (props?.$largefont ? '1.1em;' : '.8em;')};
  height: 22px;
  max-width: ${(props) => (props.$cellwidth ? `${props.$cellwidth}px;` : ';')};
  min-width: ${(props) => (props.$cellwidth ? `${props.$cellwidth}px;` : ';')};
  width: ${(props) => (props.$cellwidth ? `${props.$cellwidth}px;` : ';')};
  overflow: hidden;
  white-space: nowrap;
`;

export default withStyles(styles)(TeamHeader);
