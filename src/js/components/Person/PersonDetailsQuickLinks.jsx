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

  const [quickLinkCopied, setQuickLinkCopied] = useState('');

  const copyQuickLink = () => {
    setQuickLinkCopied('Copied!');
    setTimeout(() => {
      setQuickLinkCopied('');
    }, 1500);
  };

  const canEditPerson = viewerCanSeeOrDo(['canEditPersonAnyone'], viewerAccessRights) || viewerCanSeeOrDoForThisTeam('canEditPersonThisTeam', teamId, viewerTeamAccessRights);
  return (
    <PersonDetailsQuickLinksWrapper>
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
                  LinkedIn
                </span>
              )}
            />
          </Suspense>
          <CopyToClipboard text={person.linkedInUrl} onCopy={() => copyQuickLink()}>
            <ContentCopyStyled />
          </CopyToClipboard>
        </QuickLinksRow>
      )}
      {(canEditPerson && person.jazzHrUrl) && (
        <QuickLinksRow>
          <Suspense fallback={<></>}>
            <StyledOpenExternalWebsite
              linkIdAttribute="jazzHrLink"
              url={person.jazzHrUrl}
              target="_blank"
              body={(
                <span>
                  <LaunchStyled />
                  JazzHR
                </span>
              )}
            />
          </Suspense>
          <CopyToClipboard text={person.jazzHrUrl} onCopy={() => copyQuickLink()}>
            <ContentCopyStyled />
          </CopyToClipboard>
        </QuickLinksRow>
      )}
      <QuickLinksRow>
        {quickLinkCopied}
      </QuickLinksRow>
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
