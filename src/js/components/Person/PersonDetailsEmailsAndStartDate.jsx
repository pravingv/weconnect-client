import { ContentCopy } from '@mui/icons-material';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';
import { SpanWithLinkStyle } from '../Style/linkStyles';
import DesignTokenColors from '../../common/components/Style/DesignTokenColors';
import { useConnectAppContext } from '../../contexts/ConnectAppContext';
import { viewerCanSeeOrDo, viewerCanSeeOrDoForThisTeam } from '../../models/AuthModel';


const PersonDetailsEmailsAndStartDate = ({ person, teamId }) => {
  renderLog('PersonDetailsEmailsAndStartDate');  // Set LOG_RENDER_EVENTS to log all renders
  const { apiDataCache } = useConnectAppContext();
  const { viewerAccessRights, viewerTeamAccessRights } = apiDataCache;

  const [emailOfficialCopied, setEmailOfficialCopied] = useState(false);
  const [emailPersonalCopied, setEmailPersonalCopied] = useState(false);
  const [emailPreferredCopied, setEmailPreferredCopied] = useState(false);

  const copyEmailOfficial = () => {
    setEmailOfficialCopied(true);
    setTimeout(() => {
      setEmailOfficialCopied(false);
    }, 1500);
  };

  const copyEmailPersonal = () => {
    setEmailPersonalCopied(true);
    setTimeout(() => {
      setEmailPersonalCopied(false);
    }, 1500);
  };

  const copyEmailPreferred = () => {
    setEmailPreferredCopied(true);
    setTimeout(() => {
      setEmailPreferredCopied(false);
    }, 1500);
  };

  const canEditPerson = viewerCanSeeOrDo(['canEditPersonAnyone'], viewerAccessRights) || viewerCanSeeOrDoForThisTeam('canEditPersonThisTeam', teamId, viewerTeamAccessRights);
  const preferredEmail = person.emailPreferred || person.emailOfficial || '';
  return (
    <PersonDetailsEmailsAndStartDateWrapper>
      {preferredEmail && (
        <QuickLinksRow>
          <div>
            Preferred:&nbsp;
          </div>
          <div>
            <CopyToClipboard text={preferredEmail} onCopy={() => copyEmailPreferred()}>
              <EmailAddressToBeCopied>
                <ContentCopyStyled />
                <SpanWithLinkStyle>{emailPreferredCopied ? 'Copied!' : preferredEmail}</SpanWithLinkStyle>
              </EmailAddressToBeCopied>
            </CopyToClipboard>
          </div>
        </QuickLinksRow>
      )}
      {(person.emailOfficial && (preferredEmail !== person.emailOfficial)) && (
        <QuickLinksRow>
          <div>
            Official:&nbsp;&nbsp;
          </div>
          <div>
            {person.emailOfficial && (
              <CopyToClipboard text={person.emailOfficial} onCopy={() => copyEmailOfficial()}>
                <EmailAddressToBeCopied>
                  <ContentCopyStyled />
                  <SpanWithLinkStyle>{emailOfficialCopied ? 'Copied!' : person.emailOfficial || '(email needed)'}</SpanWithLinkStyle>
                </EmailAddressToBeCopied>
              </CopyToClipboard>
            )}
          </div>
        </QuickLinksRow>
      )}
      {(canEditPerson && person.emailPersonal) && (
        <QuickLinksRow>
          <div>
            Personal:&nbsp;&nbsp;
          </div>
          <div>
            <CopyToClipboard text={person.emailPersonal} onCopy={() => copyEmailPersonal()}>
              <EmailAddressToBeCopied>
                <ContentCopyStyled />
                <SpanWithLinkStyle>{emailPersonalCopied ? 'Copied!' : person.emailPersonal}</SpanWithLinkStyle>
              </EmailAddressToBeCopied>
            </CopyToClipboard>
          </div>
        </QuickLinksRow>
      )}
    </PersonDetailsEmailsAndStartDateWrapper>
  );
};
PersonDetailsEmailsAndStartDate.propTypes = {
  person: PropTypes.object.isRequired,
  teamId: PropTypes.number,
};

const ContentCopyStyled = styled(ContentCopy)`
  color: ${DesignTokenColors.primary500};
  height: 16px;
  margin-bottom: -3px;
  margin-left: 4px;
`;

const PersonDetailsEmailsAndStartDateWrapper = styled('div')`
  //align-items: flex-start;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const QuickLinksRow = styled('div')`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-size: 15px;
`;

const EmailAddressToBeCopied = styled('p')`
  cursor: pointer;
  margin: 0;
`;

export default PersonDetailsEmailsAndStartDate;
