import styled from 'styled-components';
import DesignTokenColors from '../../common/components/Style/DesignTokenColors';


// eslint-disable-next-line import/prefer-default-export
export const SpanWithLinkStyle = styled('span')`
  text-decoration: underline;
  color: ${DesignTokenColors.primary500};
  cursor: pointer;
`;

export const ButtonWithLinkStyle = styled('button')`
  text-decoration: underline;
  color: ${DesignTokenColors.primary500};
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
`;

