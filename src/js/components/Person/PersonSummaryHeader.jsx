import React from 'react';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';


const PersonSummaryHeader = () => {
  renderLog('PersonHeader');  // Set LOG_RENDER_EVENTS to log all renders

  return (
    <OnePersonHeader>
      <PersonHeaderCell $cellwidth={180}>
        Name
      </PersonHeaderCell>
      <PersonHeaderCell $cellwidth={150}>
        Location
      </PersonHeaderCell>
      <PersonHeaderCell $cellwidth={200}>
        Title
      </PersonHeaderCell>
      {/* Edit icon */}
      <PersonHeaderCell $cellwidth={20} />
    </OnePersonHeader>
  );
};

const OnePersonHeader = styled('div')`
  align-items: center;
  display: flex;
  justify-content: flex-start;
  margin-top: 10px;
`;

const PersonHeaderCell = styled.div`
  border-bottom: ${(props) => (props.$titlecell ? 'initial;' : '1px solid #ccc;')}
  align-content: center;
  height: 22px;
  font-size: ${(props) => (props?.$largefont ? '1.1em;' : '.8em;')};
  min-width: ${(props) => (props.$cellwidth ? `${props.$cellwidth}px;` : ';')};
  max-width: ${(props) => (props.$cellwidth ? `${props.$cellwidth}px;` : ';')};
  width: ${(props) => (props.$cellwidth ? `${props.$cellwidth}px;` : ';')};
  overflow: hidden;
  white-space: nowrap;
`;

export default PersonSummaryHeader;
