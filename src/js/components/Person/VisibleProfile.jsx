import { ContentCopy, Launch } from '@mui/icons-material';
import PropTypes from 'prop-types';
import React, { Suspense, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';
import { useGetPersonById } from '../../models/PersonModel';
import DesignTokenColors from '../../common/components/Style/DesignTokenColors';

const OpenExternalWebSite = React.lazy(() => import(/* webpackChunkName: 'OpenExternalWebSite' */ '../../common/components/Widgets/OpenExternalWebSite'));

const VisibleProfile = ({ personId }) => {
  renderLog('VisibleProfile');  // Set LOG_RENDER_EVENTS to log all renders
  const [quickLinkCopied, setQuickLinkCopied] = useState('');

  const person = useGetPersonById(personId);
  const emailToShow = person.emailPreferred || person.emailOfficial || '';

  const copyQuickLink = () => {
    setQuickLinkCopied('Copied!');
    setTimeout(() => {
      setQuickLinkCopied('');
    }, 1500);
  };

  return (
    <VisibleProfileWrapper>
      <div>personId: {personId}</div>
      <OneRow>
        <FieldName>
          First Name
          {person.firstNamePreferred && <> (preferred)</>}
          :
        </FieldName>
        <FieldValue>{person.firstNamePreferred || person.firstName}</FieldValue>
      </OneRow>
      <OneRow>
        <FieldName>
          Last Name:
        </FieldName>
        <FieldValue>{person.lastName}</FieldValue>
      </OneRow>
      <OneRow>
        <FieldName>
          Location:
        </FieldName>
        <FieldValue>{person.location}</FieldValue>
      </OneRow>
      <OneRow>
        <FieldName>
          Job Title:
        </FieldName>
        <FieldValue>{person.jobTitle}</FieldValue>
      </OneRow>
      {emailToShow && (
        <OneRow>
          <FieldName>
            Email:
          </FieldName>
          <FieldValue>
            {quickLinkCopied ? `${quickLinkCopied}` : (
              <CopyToClipboard text={emailToShow} onCopy={() => copyQuickLink()}>
                <span>
                  {emailToShow}
                  <ContentCopyStyled />
                </span>
              </CopyToClipboard>
            )}
          </FieldValue>
        </OneRow>
      )}
      {person.jazzHrUrl && (
        <OneRow>
          <FieldValueLight>
            <Suspense fallback={<></>}>
              <OpenExternalWebSite
                linkIdAttribute="jazzHrUrlId"
                url={person.jazzHrUrl}
                target="_blank"
                body={(
                  <span>
                    JazzHR profile
                    <LaunchStyled />
                  </span>
                )}
              />
            </Suspense>
          </FieldValueLight>
          {person.jazzHrUrl.endsWith('/profile') && (
            <FieldValueLight>
              <Suspense fallback={<></>}>
                <OpenExternalWebSite
                  linkIdAttribute="jazzHrEmailsUrlId"
                  url={person.jazzHrUrl.replace(/\/profile$/, '/message')}
                  target="_blank"
                  body={(
                    <span>
                      JazzHR emails
                      <LaunchStyled />
                    </span>
                  )}
                />
              </Suspense>
            </FieldValueLight>
          )}
        </OneRow>
      )}
      {person.linkedInUrl && (
        <OneRow>
          <FieldValueLight>
            <Suspense fallback={<></>}>
              <OpenExternalWebSite
                linkIdAttribute="linkedInUrlId"
                url={person.linkedInUrl}
                target="_blank"
                body={(
                  <span>
                    LinkedIn profile
                    <LaunchStyled />
                  </span>
                )}
              />
            </Suspense>
          </FieldValueLight>
        </OneRow>
      )}
    </VisibleProfileWrapper>
  );
};
VisibleProfile.propTypes = {
  personId: PropTypes.number,
};

const ContentCopyStyled = styled(ContentCopy)`
  color: ${DesignTokenColors.neutral300};
  height: 16px;
  margin-left: 4px;
  width: 16px;
`;

const FieldName = styled('div')`
  margin-right: 10px;
`;

const FieldValue = styled('div')`
  font-weight: bold;
  margin-right: 12px;
`;

const FieldValueLight = styled('div')`
  margin-right: 12px;
`;

const LaunchStyled = styled(Launch)`
  color: ${DesignTokenColors.primary500};
  cursor: pointer;
  margin-left: 2px;
  margin-top: -3px;
  width: 14px;
  height: 14px;
`;

const OneRow = styled('div')`
  display: flex;
  justify-content: flex-start;
  margin-top: 10px;
`;

const VisibleProfileWrapper = styled('div')`
`;

export default VisibleProfile;
