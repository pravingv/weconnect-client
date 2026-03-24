import { ContentCopy, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import styled from 'styled-components';
import DesignTokenColors from '../../common/components/Style/DesignTokenColors';
import { formatDateMMMDo, timeFromDate } from '../../common/utils/dateFormat';
import { renderLog } from '../../common/utils/logging';
import webAppConfig from '../../config';
import { useConnectAppContext } from '../../contexts/ConnectAppContext';
import { viewerCanSeeOrDo, viewerCanSeeOrDoForThisTeam } from '../../models/AuthModel';
import { getFullNamePreferredPerson } from '../../models/PersonModel';
import { DetailsRowItem, DetailsRowSection } from '../Style/actionBarStyles';
import { ButtonWithLinkStyle, SpanWithLinkStyle } from '../Style/linkStyles';
import TaskListForPersonManager from '../Task/TaskListForPersonManager';
import PersonAvatar from './PersonAvatar';
import PersonDetailsEmailsAndStartDate from './PersonDetailsEmailsAndStartDate';
import PersonDetailsQuickLinks from './PersonDetailsQuickLinks';
import PersonSummaryRowTripleDot from './PersonSummaryRowTripleDot';


const PersonSummaryRow = ({ hideTasks, personRowUnfurledFromParent, person, teamId, classes }) => {
  renderLog('PersonSummaryRow');  // Set LOG_RENDER_EVENTS to log all renders
  const { apiDataCache, setAppContextValue } = useConnectAppContext();
  const { allPeopleTeamIdLists, viewerAccessRights, viewerTeamAccessRights } = apiDataCache;

  const [personNumberOfTeams, setPersonNumberOfTeams] = useState(0);
  const [personRowUnfurled, setPersonRowUnfurled] = useState(personRowUnfurledFromParent);
  const [personRowUnfurledFromParentAlreadySet, setPersonRowUnfurledFromParentAlreadySet] = useState(personRowUnfurledFromParent);
  const [personStatus, setPersonStatus] = useState('');
  const [nameCopied, setNameCopied] = useState(false);
  const [officialEmailCopied, setOfficialEmailCopied] = useState(false);
  const [personalEmailCopied, setPersonalEmailCopied] = useState(false);

  const copyName = () => {
    setNameCopied(true);
    setTimeout(() => {
      setNameCopied(false);
    }, 1500);
  };

  const copyOfficialEmail = () => {
    setOfficialEmailCopied(true);
    setTimeout(() => {
      setOfficialEmailCopied(false);
    }, 1500);
  };

  const copyPersonalEmail = () => {
    setPersonalEmailCopied(true);
    setTimeout(() => {
      setPersonalEmailCopied(false);
    }, 1500);
  };

  const viewPersonClick = (hasEditRights = false) => {
    setAppContextValue('headerProfileDrawerOpen', true);
    setAppContextValue('profileDrawerPerson', person);
    setAppContextValue('profileDrawerPersonId', person.personId);
    if (hasEditRights) {
      setAppContextValue('headerProfileSection', 'nameAndPhoto');
    } else {
      setAppContextValue('headerProfileSection', 'visibleProfile');
    }
  };

  useEffect(() => {
    if (personRowUnfurledFromParent !== personRowUnfurledFromParentAlreadySet) {
      setPersonRowUnfurled(personRowUnfurledFromParent);
      setPersonRowUnfurledFromParentAlreadySet(personRowUnfurledFromParent);
    }
  }, [personRowUnfurled, personRowUnfurledFromParent, personRowUnfurledFromParentAlreadySet]);

  useEffect(() => {
    let personNumberOfTeamsTemp = 0;
    if (allPeopleTeamIdLists && allPeopleTeamIdLists[person.personId]) {
      personNumberOfTeamsTemp = allPeopleTeamIdLists[person.personId].length;
    }
    if (personNumberOfTeamsTemp !== personNumberOfTeams) {
      setPersonNumberOfTeams(personNumberOfTeamsTemp);
    }
  }, [allPeopleTeamIdLists, person]);

  useEffect(() => {
    let personStatusTemp = '';
    if (!person.statusActive) {
      personStatusTemp = 'account off';
    } else if (person.statusOfferDecisionNeeded) {
      personStatusTemp = 'interview needed';
    } else if (person.statusOfferWillNotBeMade) {
      personStatusTemp = 'offer won\'t be made';
    } else if (!person.statusOfferApproved) {
      personStatusTemp = 'hiring manager deciding';
    } else if (!person.statusOfferQuestionnaireSent) {
      personStatusTemp = 'needs questionnaire';
    } else if (!person.statusOfferQuestionnaireAnswered) {
      personStatusTemp = 'questionnaire sent';
    } else if (!person.statusOfferLetterCreated) {
      personStatusTemp = 'needs offer';
    } else if (!person.statusOfferLetterSigned) {
      personStatusTemp = 'waiting for signature';
    } else if (person.statusResigned) {
      personStatusTemp = 'resigned';
    } else if (person.statusOnLeave) {
      personStatusTemp = 'on leave';
    }
    setPersonStatus(personStatusTemp);
  }, [person]);

  const canEditPerson = viewerCanSeeOrDo(['canEditPersonAnyone'], viewerAccessRights) || viewerCanSeeOrDoForThisTeam('canEditPersonThisTeam', teamId, viewerTeamAccessRights);
  const emailPersonalTurnedOn = false;
  const startDateIsInFuture = person.dateStartDate && new Date(person.dateStartDate) > new Date();
  return (
    <OnePersonOuterWrapper>
      <PersonMainRow key={`teamMember-${person.personId}`}>
        <PersonCell
          $cellwidth={20}
        >
          &nbsp;
        </PersonCell>
        <PersonCell
          id={`index-personId-${person.personId}`}
          $cellwidth={25}
          onClick={() => setPersonRowUnfurled(!personRowUnfurled)}
        >
          {personRowUnfurled ? (
            <KeyboardArrowUpStyled />
          ) : (
            <KeyboardArrowDownStyled />
          )}
        </PersonCell>
        <PersonAvatar
          isAuthenticated
          slackImage={person.slackImage48}
          styles={{ paddingRight: '4px', maxWidth: '100%', maxHeight: '100%' }}
        />
        <PersonCell
          id={`fullNamePreferred-personId-${person.personId}`}
          $cellwidth={180}
        >
          <SpanWithLinkStyle
            className={classes.teamMemberName}
            onClick={() => viewPersonClick(canEditPerson)}
          >
            {getFullNamePreferredPerson(person)}
          </SpanWithLinkStyle>
          <ShowNameOnHover>
            <CopyToClipboard text={getFullNamePreferredPerson(person)} onCopy={() => copyName()}>
              <CopyNameToClipboardContainer>
                {nameCopied ? (
                  <ContentCopyNameText>
                    Copied!
                  </ContentCopyNameText>
                ) : (
                  <SpanWithLinkStyle>
                    <ContentCopyNameStyled />
                  </SpanWithLinkStyle>
                )}
              </CopyNameToClipboardContainer>
            </CopyToClipboard>
          </ShowNameOnHover>
        </PersonCell>
        <PersonCell
          id={`location-personId-${person.personId}`}
          $cellwidth={150}
          $smallfont
        >
          {person.location}
        </PersonCell>
        <PersonCell
          id={`jobTitle-personId-${person.personId}`}
          $cellwidth={250}
          $smallestfont
        >
          {person.jobTitle}
          {personNumberOfTeams > 1 && (
            <NumberOfTeams>
              {' '}
              ({personNumberOfTeams})
            </NumberOfTeams>
          )}
        </PersonCell>
        <HideOnHover>
          <PersonCell
            $cellwidth={300}
            $rightAlign
            $smallestfont
          >
            <div>
              {person.dateStartDate ? (
                <span>
                  {startDateIsInFuture ? (
                    <span>{personStatus && `${personStatus}: `}{formatDateMMMDo(person.dateStartDate)} start</span>
                  ) : (
                    <span>
                      {person.statusOfferLetterSigned ? (
                        <span>{personStatus && `${personStatus}: `}{timeFromDate(person.dateStartDate, true)}</span>
                      ) : (
                        <span>{personStatus && `${personStatus}: `}{formatDateMMMDo(person.dateStartDate)} start</span>
                      )}
                    </span>
                  )}
                </span>
              ) : (
                <span>
                  {personStatus ? (
                    <span>
                      {personStatus}
                    </span>
                  ) : (
                    <span>
                      no start date
                    </span>
                  )}
                </span>
              )}
            </div>
          </PersonCell>
        </HideOnHover>
        <ShowOnHover>
          {person.emailOfficial ? (
            <PersonCell
              $cellwidth={111}
              $smallestfont
            >
              <CopyToClipboard text={person.emailOfficial} onCopy={() => copyOfficialEmail()}>
                <CopyToClipboardContainer>
                  <ContentCopyStyled />
                  <ContentCopyText>
                    <SpanWithLinkStyle>
                      {officialEmailCopied ? 'Copied!' : `${webAppConfig.ORGANIZATION_NAME || 'Official'} email`}
                    </SpanWithLinkStyle>
                  </ContentCopyText>
                </CopyToClipboardContainer>
              </CopyToClipboard>
            </PersonCell>
          ) : (
            <PersonCell
              $cellwidth={111}
              $smallestfont
            >
              &nbsp;
            </PersonCell>
          )}
          {emailPersonalTurnedOn && (
            <div>
              {person.emailPersonal ? (
                <PersonCell
                  $cellwidth={118}
                  $smallestfont
                >
                  <CopyToClipboard text={person.emailPersonal} onCopy={() => copyPersonalEmail()}>
                    <CopyToClipboardContainer>
                      <ContentCopyStyled />
                      <ContentCopyText>
                        <SpanWithLinkStyle>
                          {personalEmailCopied ? 'Copied!' : 'Personal email'}
                        </SpanWithLinkStyle>
                      </ContentCopyText>
                    </CopyToClipboardContainer>
                  </CopyToClipboard>
                </PersonCell>
              ) : (
                <PersonCell
                  $cellwidth={118}
                  $smallestfont
                >
                  &nbsp;
                </PersonCell>
              )}
            </div>
          )}
          {canEditPerson && (
            <PersonCell
              id={`editPerson-personId-${person.personId}`}
              onClick={() => viewPersonClick(canEditPerson)}
              $cellwidth={30}
              $smallestfont
            >
              <ButtonWithLinkStyle>
                Edit
              </ButtonWithLinkStyle>
            </PersonCell>
          )}
          <PersonSummaryRowTripleDot person={person} teamId={teamId} />
        </ShowOnHover>
      </PersonMainRow>
      {personRowUnfurled && (
        <PersonDetailsRow>
          <DetailsRowSection>
            <DetailsRowItem>
              <PersonDetailsQuickLinks person={person} teamId={teamId} />
            </DetailsRowItem>
          </DetailsRowSection>
          <DetailsRowSection $borderRightOff>
            <DetailsRowItem>
              <PersonDetailsEmailsAndStartDate person={person} teamId={teamId} />
            </DetailsRowItem>
          </DetailsRowSection>
        </PersonDetailsRow>
      )}
      {personRowUnfurled && !hideTasks && (
        <PersonTasksRow>
          <TaskListForPersonManager personId={person.id} />
        </PersonTasksRow>
      )}
    </OnePersonOuterWrapper>
  );
};
PersonSummaryRow.propTypes = {
  classes: PropTypes.object,
  hideTasks: PropTypes.bool,
  personRowUnfurledFromParent: PropTypes.bool,
  person: PropTypes.object.isRequired,
  teamId: PropTypes.number,
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
  teamMemberName: {
    fontWeight: 600,
    textDecoration: 'none',
    color: `${DesignTokenColors.neutral800}`,
  },
});

const ContentCopyNameStyled = styled(ContentCopy)`
  color: ${DesignTokenColors.primary500};
  height: 16px;
  margin: 0;
  margin-bottom: -2px;
  width: 16px;
`;

const ContentCopyStyled = styled(ContentCopy)`
  color: ${DesignTokenColors.primary500};
  height: 16px;
  margin: 0 4px;
  width: 16px;
`;

const ContentCopyNameText = styled('p')`
  color: ${DesignTokenColors.primary500};
  // margin-bottom: 2px;
  padding-right: 8px;
`;

const ContentCopyText = styled('p')`
  color: ${DesignTokenColors.primary500};
  padding-right: 8px;
`;

const CopyNameToClipboardContainer = styled('div')`
  align-items: center;
  cursor: pointer;
  display: flex;
  height: 18px;
  justify-content: flex-start;
`;

const CopyToClipboardContainer = styled('div')`
  align-items: center;
  border-right: 1px solid ${DesignTokenColors.neutralUI300};
  cursor: pointer;
  display: flex;
  height: 18px;
  justify-content: flex-start;
  padding-right: 8px;
`;

const KeyboardArrowDownStyled = styled(KeyboardArrowDown)`
`;

const KeyboardArrowUpStyled = styled(KeyboardArrowUp)`
`;

const OnePersonOuterWrapper = styled('div')`
  &:nth-child(even){
    background-color: ${DesignTokenColors.neutral50};
  }
`;

const HideOnHover = styled('div')`
  display: flex;
  // display: none;
  align-items: center;
  justify-content: flex-end;
`;

const ShowOnHover = styled('div')`
  // display: flex;
  display: none;
  align-items: center;
  justify-content: flex-end;
  width: 309px;
`;

const ShowNameOnHover = styled('span')`
  display: none;
  margin-left: 4px;
`;

const NumberOfTeams = styled('span')`
  color: ${DesignTokenColors.neutralUI300};
`;

const PersonDetailsRow = styled('div')`
  align-items: center;
  display: flex;
  justify-content: flex-start;
  padding-bottom: 20px;
  padding-left: 27px;
  padding-top: 15px;
  border-bottom: 1px solid ${DesignTokenColors.neutralUI300};
`;

const PersonTasksRow = styled('div')`
  align-items: center;
  display: flex;
  justify-content: flex-start;
  padding-bottom: 12px;
  padding-left: 14px;
  padding-top: 6px;
  border-bottom: 1px solid ${DesignTokenColors.neutralUI300};
`;

const PersonMainRow = styled('div')`
  align-items: center;
  display: flex;
  height: 22px;
  justify-content: flex-start;
  border-bottom: 1px solid ${DesignTokenColors.neutralUI300};

  &:hover {
    ${HideOnHover} {
      display: none;
    }
    ${ShowOnHover} {
      display: flex;
    }
  }
`;

const fontSz = (smallfont, smallestfont) => {
  if (smallfont && !smallestfont) {
    return '.9em;';
  } else if (smallestfont && !smallfont) {
    return '.8em;';
  }
  return ';';
};

const PersonCell = styled.div`
  align-content: center;
  ${(props) => (props.$rightAlign ? 'display: flex;' : '')};
  ${(props) => (props.$rightAlign ? 'justify-content: flex-end;' : '')};
  font-size: ${(props) => (fontSz(props?.$smallfont, props?.$smallestfont))}
  height: 22px;
  min-width: ${(props) => (props.$cellwidth ? `${props.$cellwidth}px;` : ';')};
  max-width: ${(props) => (props.$cellwidth ? `${props.$cellwidth}px;` : ';;')};
  width: ${(props) => (props.$cellwidth ? `${props.$cellwidth}px;` : ';')};
  overflow: hidden;
  white-space: nowrap;

  &:hover {
    ${ShowNameOnHover} {
      display: inline-block;
    }
  }
`;

export default withStyles(styles)(PersonSummaryRow);
