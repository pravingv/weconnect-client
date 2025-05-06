import { ContentCopy, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import styled from 'styled-components';
import DesignTokenColors from '../../common/components/Style/DesignTokenColors';
import { renderLog } from '../../common/utils/logging';
import PersonDetailsQuickLinks from './PersonDetailsQuickLinks';
import PersonDetailsEmailsAndStartDate from './PersonDetailsEmailsAndStartDate';
import PersonSummaryRowTripleDot from './PersonSummaryRowTripleDot';
import { useConnectAppContext } from '../../contexts/ConnectAppContext';
import { getFullNamePreferredPerson } from '../../models/PersonModel';
import { SpanWithLinkStyle, ButtonWithLinkStyle } from '../Style/linkStyles';
import { viewerCanSeeOrDo, viewerCanSeeOrDoForThisTeam } from '../../models/AuthModel';
import { DetailsRowItem, DetailsRowSection } from '../Style/actionBarStyles';
import { formatDateMMMDo, timeFromDate } from '../../common/utils/dateFormat';
import webAppConfig from '../../config';
import TaskListForPersonManager from '../Task/TaskListForPersonManager';


const PersonSummaryRow = ({ hideTasks, personRowUnfurledFromParent, person, teamId, classes }) => {
  renderLog('PersonSummaryRow');  // Set LOG_RENDER_EVENTS to log all renders
  const { apiDataCache, setAppContextValue } = useConnectAppContext();
  const { viewerAccessRights, viewerTeamAccessRights } = apiDataCache;

  const [personRowUnfurled, setPersonRowUnfurled] = useState(personRowUnfurledFromParent);
  const [personRowUnfurledFromParentAlreadySet, setPersonRowUnfurledFromParentAlreadySet] = useState(personRowUnfurledFromParent);
  const [personStatus, setPersonStatus] = useState('');
  const [quickLinkCopied, setQuickLinkCopied] = useState('');

  const copyQuickLink = () => {
    setQuickLinkCopied('Copied!');
    setTimeout(() => {
      setQuickLinkCopied('');
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
    let personStatusTemp = '';
    if (!person.statusOfferApproved) {
      personStatusTemp = 'hiring manager deciding';
    } else if (person.statusOfferWillNotBeMade) {
      personStatusTemp = 'offer won\'t be made';
    } else if (!person.statusOfferQuestionnaireSent) {
      personStatusTemp = 'needs questionnaire';
    } else if (!person.statusOfferQuestionnaireAnswered) {
      personStatusTemp = 'questionnaire sent';
    } else if (!person.statusOfferLetterCreated) {
      personStatusTemp = 'needs offer';
    } else if (!person.statusOfferLetterSigned) {
      personStatusTemp = 'waiting for signature';
    }
    setPersonStatus(personStatusTemp);
  }, [person]);

  const canEditPerson = viewerCanSeeOrDo(['canEditPersonAnyone'], viewerAccessRights) || viewerCanSeeOrDoForThisTeam('canEditPersonThisTeam', teamId, viewerTeamAccessRights);
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
        <PersonCell
          id={`fullNamePreferred-personId-${person.personId}`}
          onClick={() => viewPersonClick(canEditPerson)}
          $cellwidth={180}
        >
          <SpanWithLinkStyle className={classes.teamMemberName}>
            {getFullNamePreferredPerson(person)}
          </SpanWithLinkStyle>
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
          $cellwidth={200}
          $smallestfont
        >
          {person.jobTitle}
        </PersonCell>
        <HideOnHover>
          <PersonCell
            $cellwidth={250}
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
                        <span>
                          {timeFromDate(person.dateStartDate, true)}
                        </span>
                      ) : (
                        <span>{personStatus}: {formatDateMMMDo(person.dateStartDate)} start</span>
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
              $cellwidth={150}
              $smallestfont
            >
              {quickLinkCopied || (
                <CopyToClipboard text={person.emailOfficial} onCopy={() => copyQuickLink()}>
                  <CopyToClipboardContainer>
                    <ContentCopyStyled />
                    <ContentCopyText>Copy {webAppConfig.ORGANIZATION_NAME || 'Official'} email</ContentCopyText>
                  </CopyToClipboardContainer>
                </CopyToClipboard>
              )}
            </PersonCell>
          ) : (
            <PersonCell
              $cellwidth={150}
              $smallestfont
            >
              &nbsp;
            </PersonCell>
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
          <DetailsRowSection borderRightOff>
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

const ContentCopyStyled = styled(ContentCopy)`
  color: ${DesignTokenColors.primary500};
  height: 16px;
  margin: 0 4px;
  width: 16px;
`;

const ContentCopyText = styled('p')`
  color: ${DesignTokenColors.primary500};
  font-weight: bold;
  padding-right: 8px;
`;

const CopyToClipboardContainer = styled('div')`
  align-items: center;
  border-right: 1px solid ${DesignTokenColors.neutralUI300};
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
  align-items: center;
  justify-content: flex-end;
  min-width: 250px;
  max-width: 250px;
  width: 250px;
`;

const ShowOnHover = styled('div')`
  display: none;
  align-items: center;
  justify-content: flex-end;
  min-width: 250px;
  max-width: 250px;
  width: 220px;
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
`;

export default withStyles(styles)(PersonSummaryRow);
