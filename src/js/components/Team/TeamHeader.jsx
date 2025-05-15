import {
  ContentCopy,
  KeyboardArrowDown,
  KeyboardArrowUp,
  PersonAddAltOutlined,
} from '@mui/icons-material';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { Link } from 'react-router';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';
import DesignTokenColors from '../../common/components/Style/DesignTokenColors';
import { useConnectAppContext } from '../../contexts/ConnectAppContext';
import { viewerCanSeeOrDo } from '../../models/AuthModel';
import { EditStyled } from '../Style/iconStyles';
import CohortMemberList from './CohortMemberList';
import TeamMemberList from './TeamMemberList';
import { ActionBarItem, ActionBarSection } from '../Style/actionBarStyles';
import { SpanWithLinkStyle } from '../Style/linkStyles';
import { getTeamMembersListByTeamId } from '../../models/TeamModel';
import { isPersonActive, showPersonInMemberList } from '../../utils/showPerson';


const TeamHeader = (
  {
    expandAllTeamMembersFromParent, hideInactiveFromParent, searchText,
    showAllTeamMembersFromParent, showIcons, showNotOnTeam, showStatusOfferDecisionNeeded,
    team, classes,
  },
) => {
  renderLog('TeamHeader');
  const { apiDataCache, getAppContextValue, setAppContextValue } = useConnectAppContext();
  const { viewerAccessRights } = apiDataCache;

  const [expandAllTeamMembers, setExpandAllTeamMembers] = useState(expandAllTeamMembersFromParent);
  const [hideInactive] = useState(hideInactiveFromParent);
  const [officialEmailsToCopy, setOfficialEmailsToCopy] = useState('');
  const [officialEmailsCopied, setOfficialEmailsCopied] = useState(false);
  const [personalEmailsToCopy, setPersonalEmailsToCopy] = useState('');
  const [personalEmailsCopied, setPersonalEmailsCopied] = useState(false);
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

  const copyOfficialEmails = () => {
    setOfficialEmailsCopied(true);
    setTimeout(() => {
      setOfficialEmailsCopied(false);
    }, 1500);
  };

  const copyPersonalEmails = () => {
    setPersonalEmailsCopied(true);
    setTimeout(() => {
      setPersonalEmailsCopied(false);
    }, 1500);
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

  useEffect(() => {
    let officialEmails = '';
    let personalEmails = '';
    let updatedTeamMemberList = [];
    if (team && team.id && apiDataCache) {
      updatedTeamMemberList = getTeamMembersListByTeamId(team.id, apiDataCache);
    }

    // console.log('TeamHeader useEffect, updatedTeamMemberList: ', updatedTeamMemberList);
    updatedTeamMemberList.forEach((person) => {
      if (showPersonInMemberList(person, searchText, getAppContextValue) && (isPersonActive(person) || !hideInactive)) {
        if (person.emailOfficial) {
          officialEmails += `${person.emailOfficial}, `;
        }
        if (person.emailPersonal) {
          personalEmails += `${person.emailPersonal}, `;
        }
      }
    });

    // Remove trailing comma and space
    officialEmails = officialEmails.replace(/, $/, '');
    personalEmails = personalEmails.replace(/, $/, '');

    setOfficialEmailsToCopy(officialEmails);
    setPersonalEmailsToCopy(personalEmails);
  }, [apiDataCache, team, searchText, hideInactive, getAppContextValue]);

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
            {teamLocal ? (
              <Link className={classes.teamLocalNameLink} to={`/team-home/${teamLocal.id}`}>
                {teamLocal.teamName}
              </Link>
            ) : (
              <>
                {showStatusOfferDecisionNeeded ? (
                  <CohortTitle>Cohort: Connect w/ Hiring Manager</CohortTitle>
                ) : (
                  <>
                    {showNotOnTeam && (
                      <CohortTitle>Cohort: Not on Team</CohortTitle>
                    )}
                  </>
                )}
              </>
            )}
          </TeamHeaderCell>
          <ShowOnHover>
            {!(showStatusOfferDecisionNeeded || showNotOnTeam) && (
              <ActionBarSection $borderRightOff={!showAllTeamMembers}>
                <ActionBarItem>
                  <SpanWithLinkStyle onClick={editTeamClick}>
                    Next meeting
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
            )}
            {showAllTeamMembers && (
              <ActionBarSection $borderRightOff={!officialEmailsToCopy && !personalEmailsToCopy}>
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
            {showAllTeamMembers && (
              <ActionBarSection $borderRightOff>
                {officialEmailsToCopy && (
                  <ActionBarItem>
                    <CopyToClipboard text={officialEmailsToCopy} onCopy={() => copyOfficialEmails()}>
                      <CopyToClipboardContainer>
                        <ContentCopyStyled />
                        <ContentCopyText>{officialEmailsCopied ? 'Copied!' : 'Official emails'}</ContentCopyText>
                      </CopyToClipboardContainer>
                    </CopyToClipboard>
                  </ActionBarItem>
                )}
                {personalEmailsToCopy && (
                  <ActionBarItem>
                    <CopyToClipboard text={personalEmailsToCopy} onCopy={() => copyPersonalEmails()}>
                      <CopyToClipboardContainer>
                        <ContentCopyStyled />
                        <ContentCopyText>{personalEmailsCopied ? 'Copied!' : 'Personal emails'}</ContentCopyText>
                      </CopyToClipboardContainer>
                    </CopyToClipboard>
                  </ActionBarItem>
                )}
              </ActionBarSection>
            )}
            {/* Edit icon */}
            {showIcons && !(showStatusOfferDecisionNeeded || showNotOnTeam) && (
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
            <TeamHeaderCell $cellwidth={150} $rightAlign>
              Volunteer for
            </TeamHeaderCell>
          </TeamHeaderPersonColumnTitles>
        )}
      </OneTeamHeaderOuterWrapper>
      {(showAllTeamMembers && team && team.id) && (
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
      {(showAllTeamMembers && (showStatusOfferDecisionNeeded || showNotOnTeam)) && (
        <>
          <CohortMemberList
            expandAllTeamMembers={expandAllTeamMembers}
            hideInactive={false}
            searchText={searchText}
            showNotOnTeam={showNotOnTeam}
            showStatusOfferDecisionNeeded={showStatusOfferDecisionNeeded}
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
  showNotOnTeam: PropTypes.bool,
  showStatusOfferDecisionNeeded: PropTypes.bool,
  team: PropTypes.object,
};

const styles = () => ({
  teamLocalNameLink: {
    color: `${DesignTokenColors.neutral800}`,
    fontWeight: 600,
    textDecoration: 'none',
  },
});

const CohortTitle = styled('div')`
  color: ${DesignTokenColors.neutral800};
  font-weight: 600;
  text-decoration: none;
`;

const ContentCopyStyled = styled(ContentCopy)`
  height: 16px;
  margin: 0 4px;
  width: 16px;
`;

const ContentCopyText = styled('p')`
`;

const CopyToClipboardContainer = styled('div')`
  align-items: center;
  cursor: pointer;
  display: flex;
  height: 18px;
  justify-content: flex-start;
  color: ${DesignTokenColors.primary500};
  &:hover {
    text-decoration: underline;
  }
`;

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

const TeamHeaderCell = styled('div')`
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
