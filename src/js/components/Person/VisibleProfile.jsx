import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';


const VisibleProfile = ({ personId }) => {
  renderLog('VisibleProfile');  // Set LOG_RENDER_EVENTS to log all renders

  return (
    <VisibleProfileWrapper>
      <div>Profile info visible to other volunteers.</div>
      <div>personId: {personId}</div>
    </VisibleProfileWrapper>
  );
};
VisibleProfile.propTypes = {
  personId: PropTypes.number,
};

const VisibleProfileWrapper = styled('div')`
`;

export default VisibleProfile;
