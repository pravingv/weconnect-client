import { ContentCopy, Launch } from '@mui/icons-material';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';
import DesignTokenColors from '../../common/components/Style/DesignTokenColors';
import { useConnectAppContext } from '../../contexts/ConnectAppContext';
import { viewerCanSeeOrDo, viewerCanSeeOrDoForThisTeam } from '../../models/AuthModel';


const PersonDetailsEmailsAndStartDate = ({ person, teamId }) => {
  renderLog('PersonDetailsEmailsAndStartDate');  // Set LOG_RENDER_EVENTS to log all renders
  const { apiDataCache } = useConnectAppContext();
  const { viewerAccessRights, viewerTeamAccessRights } = apiDataCache;

  const [quickLinkCopied, setQuickLinkCopied] = useState('');

  const copyQuickLink = () => {
    setQuickLinkCopied('Copied!');
    setTimeout(() => {
      setQuickLinkCopied('');
    }, 1500);
  };

  const canEditPerson = viewerCanSeeOrDo(['canEditPersonAnyone'], viewerAccessRights) || viewerCanSeeOrDoForThisTeam('canEditPersonThisTeam', teamId, viewerTeamAccessRights);
  const preferredEmail = person.emailPreferred || person.emailOfficial || '';
  return (
    <PersonDetailsEmailsAndStartDateWrapper>
      {preferredEmail && (
        <QuickLinksRow>
          <div>
            Preferred:
            {' '}
          </div>
          <div>
            <CopyToClipboard text={preferredEmail} onCopy={() => copyQuickLink()}>
              <span>
                {preferredEmail}
                <ContentCopyStyled />
              </span>
            </CopyToClipboard>
          </div>
        </QuickLinksRow>
      )}
      {(preferredEmail !== person.emailOfficial) && (
        <QuickLinksRow>
          <div>
            Official:
            {' '}
          </div>
          <div>
            {person.emailOfficial && (
              <CopyToClipboard text={person.emailOfficial} onCopy={() => copyQuickLink()}>
                <span>
                  {person.emailOfficial || '(email needed)'}
                  <ContentCopyStyled />
                </span>
              </CopyToClipboard>
            )}
          </div>
        </QuickLinksRow>
      )}
      {(canEditPerson && person.emailPersonal) && (
        <QuickLinksRow>
          <div>
            Personal:
            {' '}
          </div>
          <div>
            <CopyToClipboard text={person.emailPersonal} onCopy={() => copyQuickLink()}>
              <span>
                {person.emailPersonal}
                <ContentCopyStyled />
              </span>
            </CopyToClipboard>
          </div>
        </QuickLinksRow>
      )}
      <QuickLinksRow>
        {quickLinkCopied}
      </QuickLinksRow>
    </PersonDetailsEmailsAndStartDateWrapper>
  );
};
PersonDetailsEmailsAndStartDate.propTypes = {
  person: PropTypes.object.isRequired,
  teamId: PropTypes.number,
};

const ContentCopyStyled = styled(ContentCopy)`
  color: ${DesignTokenColors.neutral300};
  height: 16px;
  margin-left: 4px;
  width: 16px;
`;

const LaunchStyled = styled(Launch)`
  color: ${DesignTokenColors.primary500};
  cursor: pointer;
  margin-left: 2px;
  margin-top: -3px;
  width: 14px;
  height: 14px;
`;

const PersonDetailsEmailsAndStartDateWrapper = styled('div')`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

const QuickLinksRow = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export default PersonDetailsEmailsAndStartDate;
