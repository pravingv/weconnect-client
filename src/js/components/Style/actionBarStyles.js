import styled from 'styled-components';
import DesignTokenColors from '../../common/components/Style/DesignTokenColors';


export const ActionBarItem = styled('div')`
  padding-right: 15px;
`;

export const ActionBarSection = styled('div')`
  align-items: center;
  ${(props) => (props.$borderRightOff ? '' : `border-right: 1px solid ${DesignTokenColors.neutralUI200}`)};
  display: flex;
  font-size: .8em;
  justify-content: flex-start;
  padding-left: 15px;
`;

export const DetailsRowItem = styled('div')`
  padding-right: 15px;
`;

export const DetailsRowSection = styled('div')`
  align-items: flex-start;
  ${(props) => (props.$borderRightOff ? '' : `border-right: 1px solid ${DesignTokenColors.neutralUI200}`)};
  display: flex;
  justify-content: flex-start;
  padding-left: 15px;
`;

export const SearchBarWrapper = styled('div')`
  margin-right: 10px;
`;

