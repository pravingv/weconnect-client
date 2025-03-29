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
import { SpanWithLinkStyle } from '../Style/linkStyles';
import { viewerCanSeeOrDo, viewerCanSeeOrDoForThisTeam } from '../../models/AuthModel';
import { DetailsRowItem, DetailsRowSection } from '../Style/actionBarStyles';
import { formatDateMMMDoYYYY, timeFromDate } from '../../common/utils/dateFormat';
import webAppConfig from '../../config';


const PersonSummaryRow = ({ personRowUnfurledFromParent, person, teamId }) => {
  renderLog('PersonSummaryRow');  // Set LOG_RENDER_EVENTS to log all renders
  const { apiDataCache, setAppContextValue } = useConnectAppContext();
  const { viewerAccessRights, viewerTeamAccessRights } = apiDataCache;

  const [personRowUnfurled, setPersonRowUnfurled] = useState(personRowUnfurledFromParent);
  const [personRowUnfurledFromParentAlreadySet, setPersonRowUnfurledFromParentAlreadySet] = useState(personRowUnfurledFromParent);
  const [quickLinkCopied, setQuickLinkCopied] = useState('');

  const copyQuickLink = () => {
    setQuickLinkCopied('Copied!');
    setTimeout(() => {
      setQuickLinkCopied('');
    }, 1500);
  };

  const editPersonClick = (hasEditRights = true) => {
    if (hasEditRights) {
      setAppContextValue('headerProfileDrawerOpen', true);
      setAppContextValue('profileDrawerPerson', person);
      setAppContextValue('profileDrawerPersonId', person.personId);
    }
  };

  useEffect(() => {
    if (personRowUnfurledFromParent !== personRowUnfurledFromParentAlreadySet) {
      setPersonRowUnfurled(personRowUnfurledFromParent);
      setPersonRowUnfurledFromParentAlreadySet(personRowUnfurledFromParent);
    }
  }, [personRowUnfurled, personRowUnfurledFromParent, personRowUnfurledFromParentAlreadySet]);

  const canEditPerson = viewerCanSeeOrDo(['canEditPersonAnyone'], viewerAccessRights) || viewerCanSeeOrDoForThisTeam('canEditPersonThisTeam', teamId, viewerTeamAccessRights);
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
          onClick={() => setPersonRowUnfurled(!personRowUnfurled)}
          $cellwidth={180}
        >
          <SpanWithLinkStyle>
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
              {!person.statusOfferLetterSigned && (
                <span>
                  {/* Not signed */}
                </span>
              )}
              {person.dateStartDate && (
                <span>
                  {person.statusOfferLetterSigned ? (
                    <span>{timeFromDate(person.dateStartDate, true)}</span>
                  ) : (
                    <span>{formatDateMMMDoYYYY(person.dateStartDate)} start</span>
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
                <div>
                  <CopyToClipboard text={person.emailOfficial} onCopy={() => copyQuickLink()}>
                    <span>
                      <ContentCopyStyled />
                      Copy {webAppConfig.ORGANIZATION_NAME || 'Official'} email
                    </span>
                  </CopyToClipboard>
                </div>
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
              onClick={() => editPersonClick(true)}
              $cellwidth={30}
              $smallestfont
            >
              <SpanWithLinkStyle>
                Edit
              </SpanWithLinkStyle>
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
          <DetailsRowSection>
            <DetailsRowItem>
              <PersonDetailsEmailsAndStartDate person={person} teamId={teamId} />
            </DetailsRowItem>
          </DetailsRowSection>
        </PersonDetailsRow>
      )}
    </OnePersonOuterWrapper>
  );
};
PersonSummaryRow.propTypes = {
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
});

const ContentCopyStyled = styled(ContentCopy)`
  color: ${DesignTokenColors.neutral300};
  height: 16px;
  margin-left: 4px;
  width: 16px;
`;

const KeyboardArrowDownStyled = styled(KeyboardArrowDown)`
`;

const KeyboardArrowUpStyled = styled(KeyboardArrowUp)`
`;

const OnePersonOuterWrapper = styled('div')`
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
  width: 250px;
`;

const PersonDetailsRow = styled('div')`
  align-items: flex-start;
  display: flex;
  justify-content: flex-start;
  margin-bottom: 20px;
  margin-top: 15px;
`;

const PersonMainRow = styled('div')`
  align-items: center;
  display: flex;
  height: 22px;
  justify-content: flex-start;

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
  border-bottom: 1px solid #ccc;
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
