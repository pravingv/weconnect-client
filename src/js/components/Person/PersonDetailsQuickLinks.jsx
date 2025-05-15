import { ContentCopy, Launch } from '@mui/icons-material';
import PropTypes from 'prop-types';
import React, { Suspense, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';
import DesignTokenColors from '../../common/components/Style/DesignTokenColors';
import { viewerCanSeeOrDo, viewerCanSeeOrDoForThisTeam } from '../../models/AuthModel';
import { useConnectAppContext } from '../../contexts/ConnectAppContext';

const OpenExternalWebSite = React.lazy(() => import(/* webpackChunkName: 'OpenExternalWebSite' */ '../../common/components/Widgets/OpenExternalWebSite'));


const PersonDetailsQuickLinks = ({ person, teamId }) => {
  renderLog('PersonDetailsQuickLinks');  // Set LOG_RENDER_EVENTS to log all renders
  const { apiDataCache } = useConnectAppContext();
  const { viewerAccessRights, viewerTeamAccessRights } = apiDataCache;

  const [jazzHrEmailsCopied, setJazzHrEmailsCopied] = useState(false);
  const [jazzHrProfileCopied, setJazzHrProfileCopied] = useState(false);
  const [linkedInCopied, setLinkedInCopied] = useState(false);

  const copyJazzHrEmails = () => {
    setJazzHrEmailsCopied(true);
    setTimeout(() => {
      setJazzHrEmailsCopied(false);
    }, 1500);
  };

  const copyJazzHrProfile = () => {
    setJazzHrProfileCopied(true);
    setTimeout(() => {
      setJazzHrProfileCopied(false);
    }, 1500);
  };

  const copyLinkedIn = () => {
    setLinkedInCopied(true);
    setTimeout(() => {
      setLinkedInCopied(false);
    }, 1500);
  };

  const canEditPerson = viewerCanSeeOrDo(['canEditPersonAnyone'], viewerAccessRights) || viewerCanSeeOrDoForThisTeam('canEditPersonThisTeam', teamId, viewerTeamAccessRights);
  return (
    <PersonDetailsQuickLinksWrapper>
      {(canEditPerson && person.jazzHrUrl) && (
        <QuickLinksRow>
          <Suspense fallback={<></>}>
            <StyledOpenExternalWebsite
              linkIdAttribute="jazzHrProfileUrl"
              url={person.jazzHrUrl}
              target="_blank"
              body={(
                <span>
                  <LaunchStyled />
                  {jazzHrProfileCopied ? 'Copied!' : 'JazzHR profile'}
                </span>
              )}
            />
          </Suspense>
          <CopyToClipboard text={person.jazzHrUrl} onCopy={() => copyJazzHrProfile()}>
            <ContentCopyStyled />
          </CopyToClipboard>
        </QuickLinksRow>
      )}
      {(canEditPerson && person.jazzHrUrl && person.jazzHrUrl.endsWith('/profile')) && (
        <QuickLinksRow>
          <Suspense fallback={<></>}>
            <StyledOpenExternalWebsite
              linkIdAttribute="jazzHrEmailsUrl"
              url={person.jazzHrUrl.replace(/\/profile$/, '/message')}
              target="_blank"
              body={(
                <span>
                  <LaunchStyled />
                  {jazzHrEmailsCopied ? 'Copied!' : 'JazzHR emails'}
                </span>
              )}
            />
          </Suspense>
          <CopyToClipboard text={person.jazzHrUrl.replace(/\/profile$/, '/message')} onCopy={() => copyJazzHrEmails()}>
            <ContentCopyStyled />
          </CopyToClipboard>
        </QuickLinksRow>
      )}
      {person.linkedInUrl && (
        <QuickLinksRow>
          <Suspense fallback={<></>}>
            <StyledOpenExternalWebsite
              linkIdAttribute="linkedInUrl"
              url={person.linkedInUrl}
              target="_blank"
              body={(
                <span>
                  <LaunchStyled />
                  {linkedInCopied ? 'Copied!' : 'LinkedIn'}
                </span>
              )}
            />
          </Suspense>
          <CopyToClipboard text={person.linkedInUrl} onCopy={() => copyLinkedIn()}>
            <ContentCopyStyled />
          </CopyToClipboard>
        </QuickLinksRow>
      )}
    </PersonDetailsQuickLinksWrapper>
  );
};
PersonDetailsQuickLinks.propTypes = {
  person: PropTypes.object.isRequired,
  teamId: PropTypes.number,
};

const ContentCopyStyled = styled(ContentCopy)`
  color: ${DesignTokenColors.primary500};
  height: 16px;
  //margin-left: 4px;
  //width: 16px;
`;

const LaunchStyled = styled(Launch)`
  color: ${DesignTokenColors.primary500};
  cursor: pointer;
  margin-left: 2px;
  margin-bottom: -2px;
  width: 15px;
  height: 15px;
`;

const PersonDetailsQuickLinksWrapper = styled('div')`
  //align-items: flex-start;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

const QuickLinksRow = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StyledOpenExternalWebsite = styled(OpenExternalWebSite)`
  color: ${DesignTokenColors.primary500};
  font-size: 15px;
  font-weight: 500;
  text-decoration: none;
`;


export default PersonDetailsQuickLinks;
