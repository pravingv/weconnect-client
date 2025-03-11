import React from 'react';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';


const PersonSummaryHeader = () => {
  renderLog('PersonHeader');  // Set LOG_RENDER_EVENTS to log all renders

  return (
    <OnePersonHeader>
      {/* Width (below) of this PersonHeaderCell comes from the combined widths of the first x columns in PersonMemberList */}
      <PersonHeaderCell $largefont $titleCell $cellwidth={250}>
        &nbsp;
      </PersonHeaderCell>
      <PersonHeaderCell $cellwidth={300}>
        Location
      </PersonHeaderCell>
      <PersonHeaderCell $cellwidth={300}>
        Title / Volunteering Love
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
  font-weight: ${(props) => (props?.$titleCell ? ';' : '550;')}
  min-width: ${(props) => (props.$cellwidth ? `${props.$cellwidth}px;` : ';')};
  max-width: ${(props) => (props.$cellwidth ? `${props.$cellwidth}px;` : ';')};
  width: ${(props) => (props.$cellwidth ? `${props.$cellwidth}px;` : ';')};
  overflow: hidden;
  white-space: nowrap;
`;

export default PersonSummaryHeader;
