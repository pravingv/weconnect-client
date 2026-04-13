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
import { getTeamMemberListByTeamId, getTeamMemberPersonListByTeamId } from '../../models/TeamModel';
import { isPersonActive, showPersonInMemberList } from '../../utils/showPerson';


const TeamHeader = (
  {
    expandAllTeamMembersFromParent, hideInactiveFromParent, hideTeamMemberCount, searchText,
    showAllTeamMembersFromParent, showIcons, showNotOnTeam, showStatusOfferDecisionNeeded,
    team, classes,
  },
) => {
  renderLog('TeamHeader');
  const { apiDataCache, getAppContextValue, setAppContextValue } = useConnectAppContext();
  const { allPeopleCache, viewerAccessRights } = apiDataCache;

  const [expandAllTeamMembers, setExpandAllTeamMembers] = useState(expandAllTeamMembersFromParent);
  const [hideInactive] = useState(hideInactiveFromParent);
  const [numberOfTeamMembers, setNumberOfTeamMembers] = useState(0);
  const [officialEmailsToCopy, setOfficialEmailsToCopy] = useState('');
  const [officialEmailsCopied, setOfficialEmailsCopied] = useState(false);
  const [personalEmailsToCopy, setPersonalEmailsToCopy] = useState('');
  const [personalEmailsCopied, setPersonalEmailsCopied] = useState(false);
  const [showAllTeamMembers, setShowAllTeamMembers] = useState(showAllTeamMembersFromParent);
  const [showAllTeamMembersFromParentAlreadySet, setShowAllTeamMembersFromParentAlreadySet] = useState(showAllTeamMembersFromParent);
  const [teamLeads, setTeamLeads] = useState('');
  const [teamLeadsCount, setTeamLeadsCount] = useState(0);
  const [donorsOnTeam, setDonorsOnTeam] = useState(0);

  const teamLocal = team;
  const teamIdentifier = team?.teamId || team?.id;

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
    setAppContextValue('AddTeamDrawerLabel', 'Edit Team');
    setAppContextValue('teamForAddTeamDrawer', teamLocal);
  };

  useEffect(() => {
    if (showAllTeamMembersFromParent !== showAllTeamMembersFromParentAlreadySet) {
      setShowAllTeamMembers(showAllTeamMembersFromParent);
      setShowAllTeamMembersFromParentAlreadySet(showAllTeamMembersFromParent);
    }
  }, [showAllTeamMembers, showAllTeamMembersFromParent, showAllTeamMembersFromParentAlreadySet]);

  useEffect(() => {
    // These are the TeamMember dictionaries (as opposed to person dictionaries)
    let donorsOnTeamTemp = 0;
    let teamLeadsCountTemp = 0;
    let teamLeadsTemp = '';
    let updatedTeamMemberList = [];
    if (team && teamIdentifier && apiDataCache) {
      updatedTeamMemberList = getTeamMemberListByTeamId(teamIdentifier, apiDataCache);
    }
    updatedTeamMemberList.forEach((teamMember) => {
      if (teamMember && teamMember.personId && teamMember.personId >= 0) {
        const person = allPeopleCache[teamMember.personId];
        if (person && person.id) {
          if (isPersonActive(person) || !hideInactive) {
            if (teamMember.isTeamLead) {
              teamLeadsTemp += `${person.firstNamePreferred || person.firstName}, `;
              teamLeadsCountTemp += 1;
            }
          }
          if (isPersonActive(person)) {
            if (person.isMonthlyDonor) {
              donorsOnTeamTemp += 1;
            }
          }
        }
      }
    });
    setDonorsOnTeam(donorsOnTeamTemp);
    // Remove trailing comma and space
    teamLeadsTemp = teamLeadsTemp.replace(/, $/, '');

    setTeamLeads(teamLeadsTemp);
    setTeamLeadsCount(teamLeadsCountTemp);
  }, [apiDataCache, team]);

  useEffect(() => {
    let numberOfTeamMembersTemp = 0;
    let officialEmails = '';
    let personalEmails = '';
    let updatedTeamMemberPersonList = [];
    if (team && teamIdentifier && apiDataCache) {
      updatedTeamMemberPersonList = getTeamMemberPersonListByTeamId(teamIdentifier, apiDataCache);
    }

    updatedTeamMemberPersonList.forEach((person) => {

      if (showPersonInMemberList(person, null, getAppContextValue) && (isPersonActive(person) || !hideInactive)) {
        numberOfTeamMembersTemp += 1;
      }

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

    setNumberOfTeamMembers(numberOfTeamMembersTemp);
    setOfficialEmailsToCopy(officialEmails);
    setPersonalEmailsToCopy(personalEmails);
  }, [apiDataCache, team, searchText, hideInactive, getAppContextValue]);

  const DonorPercentage = () => {
    if (numberOfTeamMembers === 0) {
      return '';
    }
    try {
      const donorPercent = Math.round((donorsOnTeam / numberOfTeamMembers) * 100);
      console.log("team member count with team name and donors on team with %:",donorPercent,donorsOnTeam,numberOfTeamMembers,team)
      if (Number.isNaN(donorPercent)) {
        return '';
      }
      return <span style={{ color: '#9A9A9A' }}>{donorPercent}% donors</span>;
    } catch (e) {
      console.log('DonorPercentage threw error :', e);
      return '';
    }
  };

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
          <TeamHeaderCell $cellwidth={335} $largefont $titlecell $leftAlign>
            {teamLocal ? (
              <Link className={classes.teamLocalNameLink} to={`/team-home/${teamLocal?.teamId || teamLocal?.id}`}>
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
          <HideOnHover>
            {teamLeadsCount > 0 && (
              <ActionBarSection $borderRightOff={numberOfTeamMembers === 0}>
                <ActionBarItem>
                  <TeamLead>{teamLeadsCount === 1 ? 'Lead: ' : 'Leads: '}{teamLeads}</TeamLead>
                </ActionBarItem>
              </ActionBarSection>
            )}
            {!hideTeamMemberCount && numberOfTeamMembers && (
              <ActionBarSection $borderRightOff={numberOfTeamMembers === 0}>
                <ActionBarItem>
                  <TeamMemberCount>{numberOfTeamMembers} {numberOfTeamMembers === 1 ? 'person' : 'people'}</TeamMemberCount>
                </ActionBarItem>
              </ActionBarSection>
            )}
            <ActionBarSection $borderRightOff>
              <ActionBarItem>
                <DonorPercentage />
              </ActionBarItem>
            </ActionBarSection>
          </HideOnHover>
          <ShowOnHover>
            {!(showStatusOfferDecisionNeeded || showNotOnTeam) && (
              <ActionBarSection>
                <ActionBarItem>
                  <SpanWithLinkStyle onClick={editTeamClick}>
                    Edit&nbsp;team
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
            <ActionBarSection $borderRightOff={!officialEmailsToCopy && !personalEmailsToCopy}>
              <ActionBarItem>
                <SpanWithLinkStyle onClick={() => { setExpandAllTeamMembers(true); setShowAllTeamMembers(true); }}>
                  Expand&nbsp;all
                </SpanWithLinkStyle>
              </ActionBarItem>
              {showAllTeamMembers && (
                <ActionBarItem>
                  <SpanWithLinkStyle onClick={() => setExpandAllTeamMembers(false)}>
                    Collapse&nbsp;all
                  </SpanWithLinkStyle>
                </ActionBarItem>
              )}
            </ActionBarSection>
            <ActionBarSection $borderRightOff>
              {officialEmailsToCopy && (
                <ActionBarItem>
                  <CopyToClipboard text={officialEmailsToCopy} onCopy={() => copyOfficialEmails()}>
                    <CopyToClipboardContainer>
                      <ContentCopyStyled />
                      <ContentCopyText>{officialEmailsCopied ? 'Copied!' : <>Official&nbsp;emails</>}</ContentCopyText>
                    </CopyToClipboardContainer>
                  </CopyToClipboard>
                </ActionBarItem>
              )}
              {personalEmailsToCopy && (
                <ActionBarItem>
                  <CopyToClipboard text={personalEmailsToCopy} onCopy={() => copyPersonalEmails()}>
                    <CopyToClipboardContainer>
                      <ContentCopyStyled />
                      <ContentCopyText>{personalEmailsCopied ? 'Copied!' : <>Personal emails</>}</ContentCopyText>
                    </CopyToClipboardContainer>
                  </CopyToClipboard>
                </ActionBarItem>
              )}
            </ActionBarSection>
            {/* Edit icon */}
            {showIcons && !(showStatusOfferDecisionNeeded || showNotOnTeam) && (
              <>
                {viewerCanSeeOrDo(['canEditTeamAnyTeam'], viewerAccessRights) && (
                  <ActionBarItem>
                    <EditIconWrapper onClick={editTeamClick}>
                      <EditStyled />
                    </EditIconWrapper>
                  </ActionBarItem>
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
            <TeamHeaderCell $cellwidth={32} />
            <TeamHeaderCell $cellwidth={180} $leftAlign>
              Name
            </TeamHeaderCell>
            <TeamHeaderCell $cellwidth={150} $leftAlign>
              Location
            </TeamHeaderCell>
            <TeamHeaderCell $cellwidth={250} $leftAlign>
              Title
            </TeamHeaderCell>
            <TeamHeaderCell $cellwidth={150} />
            <TeamHeaderCell $cellwidth={140} $rightAlign>
              Volunteer for
            </TeamHeaderCell>
          </TeamHeaderPersonColumnTitles>
        )}
      </OneTeamHeaderOuterWrapper>
      {(showAllTeamMembers && team && teamIdentifier) && (
        <>
          {/* DO NOT REMOVE PASSED IN team */}
          <TeamMemberList
            expandAllTeamMembers={expandAllTeamMembers}
            hideInactive={hideInactive}
            searchText={searchText}
            team={team}
            teamId={teamIdentifier}
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
  hideTeamMemberCount: PropTypes.bool,
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
    display: 'block',
    fontWeight: 600,
    textAlign: 'left',
    textDecoration: 'none',
    width: '100%',
  },
});

const CohortTitle = styled('div')`
  color: ${DesignTokenColors.neutral800};
  text-align: left;
  font-weight: 600;
  text-decoration: none;
  width: 100%;
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

const HideOnHover = styled('div')`
  display: flex;
  align-items: center;
  justify-content: flex-end;
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
    ${HideOnHover} {
      display: none;
    }
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
  display: flex;
  align-items: center;
  justify-content: ${(props) => (props.$leftAlign ? 'flex-start' : 'center')};
  // border-bottom: ${(props) => (props?.$titleCell ? ';' : '1px solid #ccc;')}
  ${(props) => (props.$rightAlign ? 'justify-content: flex-end;' : '')};
  font-size: ${(props) => (props?.$largefont ? '1.1em;' : '.8em;')};
  //height: 22px;
  max-width: ${(props) => (props.$cellwidth ? `${props.$cellwidth}px;` : ';')};
  min-width: ${(props) => (props.$cellwidth ? `${props.$cellwidth}px;` : ';')};
  width: ${(props) => (props.$cellwidth ? `${props.$cellwidth}px;` : ';')};
  overflow: hidden;
  white-space: nowrap;
  cursor: pointer;
`;

const TeamLead = styled('div')`
  color: ${DesignTokenColors.neutralUI400};
  // font-size: .9em;
`;

const TeamMemberCount = styled('div')`
  color: ${DesignTokenColors.neutralUI400};
  // font-size: .8em;
`;

const EditIconWrapper = styled('div')`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

export default withStyles(styles)(TeamHeader);
