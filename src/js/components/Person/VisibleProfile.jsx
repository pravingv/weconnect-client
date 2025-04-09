import { ContentCopy } from '@mui/icons-material';
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
      {person.linkedInUrl && (
        <OneRow>
          <FieldName>
            LinkedIn:
          </FieldName>
          <FieldValue>
            <Suspense fallback={<></>}>
              <OpenExternalWebSite
                linkIdAttribute="linkedInUrlId"
                url={person.linkedInUrl}
                target="_blank"
                body={person.linkedInUrl}
              />
            </Suspense>
          </FieldValue>
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
`;

const OneRow = styled('div')`
  display: flex;
  justify-content: flex-start;
  margin-top: 10px;
`;

const VisibleProfileWrapper = styled('div')`
`;

export default VisibleProfile;
