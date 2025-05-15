import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';
import webAppConfig from '../../config';
import { SpanWithLinkStyle } from '../Style/linkStyles';


const CopyQuestionnaireLink = ({ personId, questionnaireId }) => {
  renderLog('CopyQuestionnaireLink');
  const [linkCopied, setLinkCopied] = useState(false);
  const [linkToBeShared] = useState(`${webAppConfig.PROTOCOL}${webAppConfig.HOSTNAME}/q/${questionnaireId}${personId ? `/${personId}` : ''}`);

  const copyLink = () => {
    // console.log('CopyQuestionnaireLink copyLink');
    setLinkCopied(true);
    setTimeout(() => {
      setLinkCopied(false);
    }, 1500);
  };

  return (
    <CopyQuestionnaireLinkWrapper>
      <CopyToClipboard text={linkToBeShared} onCopy={copyLink}>
        <div>
          {linkCopied ? (
            <div>Link copied!</div>
          ) : (
            <SpanWithLinkStyle>
              copy
            </SpanWithLinkStyle>
          )}
        </div>
      </CopyToClipboard>
    </CopyQuestionnaireLinkWrapper>
  );
};
CopyQuestionnaireLink.propTypes = {
  personId: PropTypes.number,
  questionnaireId: PropTypes.number.isRequired,
};

const styles = () => ({
});


const CopyQuestionnaireLinkWrapper = styled('span')`
`;

export default withStyles(styles)(CopyQuestionnaireLink);
