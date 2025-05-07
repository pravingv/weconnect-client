import { KeyboardArrowDown, KeyboardArrowUp, PersonAddAltOutlined } from '@mui/icons-material';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';
import DesignTokenColors from '../../common/components/Style/DesignTokenColors';
import { useConnectAppContext } from '../../contexts/ConnectAppContext';
import { viewerCanSeeOrDo } from '../../models/AuthModel';
import { EditStyled } from '../Style/iconStyles';
import TeamMemberList from './TeamMemberList';
import { ActionBarItem, ActionBarSection } from '../Style/actionBarStyles';
import { SpanWithLinkStyle } from '../Style/linkStyles';


const TeamHeader = ({ expandAllTeamMembersFromParent, hideInactiveFromParent, searchText, showAllTeamMembersFromParent, showIcons, team, classes }) => {
  renderLog('TeamHeader');
  const { apiDataCache, getAppContextValue, setAppContextValue } = useConnectAppContext();
  const { viewerAccessRights } = apiDataCache;

  const [expandAllTeamMembers, setExpandAllTeamMembers] = useState(expandAllTeamMembersFromParent);
  const [hideInactive] = useState(hideInactiveFromParent);
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
          <TeamHeaderCell $cellwidth={335} $largefont $titlecell>
            {teamLocal && (
              <Link className={classes.teamLocalNameLink} to={`/team-home/${teamLocal.id}`}>
                {teamLocal.teamName}
              </Link>
            )}
          </TeamHeaderCell>
          <ShowOnHover>
            <ActionBarSection>
              <ActionBarItem>
                <SpanWithLinkStyle onClick={editTeamClick}>
                  Next meeting info
                </SpanWithLinkStyle>
              </ActionBarItem>
              {viewerCanSeeOrDo(['canAddTeamMemberAnyTeam'], viewerAccessRights) && (
                <ActionBarItem>
                  <SpanWithLinkStyle onClick={() => addTeamMemberClick()}>
                    <PersonAddAltOutlinedStyled />
                  </SpanWithLinkStyle>
                </ActionBarItem>
              )}
            </ActionBarSection>
            {showAllTeamMembers && (
              <ActionBarSection>
                <ActionBarItem>
                  <SpanWithLinkStyle onClick={() => setExpandAllTeamMembers(true)}>
                    Expand all
                  </SpanWithLinkStyle>
                </ActionBarItem>
                <ActionBarItem>
                  <SpanWithLinkStyle onClick={() => setExpandAllTeamMembers(false)}>
                    Collapse all
                  </SpanWithLinkStyle>
                </ActionBarItem>
              </ActionBarSection>
            )}
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
          </ShowOnHover>
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
            <TeamHeaderCell $cellwidth={210}>
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
  classes: PropTypes.object,
  expandAllTeamMembersFromParent: PropTypes.bool,
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
  teamLocalNameLink: {
    color: `${DesignTokenColors.neutral800}`,
    fontWeight: 600,
    textDecoration: 'none',
  },
});

const KeyboardArrowDownStyled = styled(KeyboardArrowDown)`
`;

const KeyboardArrowUpStyled = styled(KeyboardArrowUp)`
`;

const OneTeamHeaderOuterWrapper = styled('div')`
`;

const OneTeamOuterWrapper = styled('div')`
  border-top: 1px solid ${DesignTokenColors.neutralUI300};
  border-left: 1px solid ${DesignTokenColors.neutralUI300};
  border-right: 1px solid ${DesignTokenColors.neutralUI300};
  margin-bottom: 15px;
`;

const PersonAddAltOutlinedStyled = styled(PersonAddAltOutlined)`
  color: ${DesignTokenColors.primary500};
  cursor: pointer;
  margin-right: 2px;
  width: 18px;
  height: 18px;
`;

const ShowOnHover = styled('div')`
  // display: flex; // Temp while I'm working on it
  display: none;
  align-items: center;
  justify-content: flex-end;
`;

const TeamHeaderMainRow = styled('div')`
  align-items: center;
  display: flex;
  justify-content: flex-start;
  height: 40px;
  border-bottom: 1px solid ${DesignTokenColors.neutralUI300};
  //margin-top: 10px;

  &:hover {
    ${ShowOnHover} {
      display: flex;
    }
  }
`;

const TeamHeaderPersonColumnTitles = styled('div')`
  align-items: center;
  display: flex;
  justify-content: flex-start;
  height: 30px;
  background-color: ${DesignTokenColors.neutral50};
  border-bottom: 1px solid ${DesignTokenColors.neutralUI300};
  color: ${DesignTokenColors.neutral800};
  //margin-top: 10px;
`;

const TeamHeaderCell = styled.div`
  align-content: center;
  // border-bottom: ${(props) => (props?.$titleCell ? ';' : '1px solid #ccc;')}
  ${(props) => (props.$rightAlign ? 'display: flex;' : '')};
  ${(props) => (props.$rightAlign ? 'justify-content: flex-end;' : '')};
  font-size: ${(props) => (props?.$largefont ? '1.1em;' : '.8em;')};
  //height: 22px;
  max-width: ${(props) => (props.$cellwidth ? `${props.$cellwidth}px;` : ';')};
  min-width: ${(props) => (props.$cellwidth ? `${props.$cellwidth}px;` : ';')};
  width: ${(props) => (props.$cellwidth ? `${props.$cellwidth}px;` : ';')};
  overflow: hidden;
  white-space: nowrap;
`;

export default withStyles(styles)(TeamHeader);
