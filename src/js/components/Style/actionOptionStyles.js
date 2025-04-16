import styled from 'styled-components';
import DesignTokenColors from '../../common/components/Style/DesignTokenColors';

export const ActionOption = styled('div')`
  border-left: 1px solid ${DesignTokenColors.neutralUI100};
  padding: 0 8px;
`;

export const ActionOptionList = styled('div')`
  align-items: center;
  display: flex;
  justify-content: flex-start;
`;

export const ActionOptionContainerOverflow = styled('div')`
  overflow: hidden;
`;

export const ActionOptionContainerLeft8 = styled('div')`
  display: block;
  position: relative;
  left: -8px;
`;
