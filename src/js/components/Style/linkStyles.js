import styled from 'styled-components';
import DesignTokenColors from '../../common/components/Style/DesignTokenColors';

export const SpanWithLinkStyle = styled('span')`
  color: ${DesignTokenColors.primary500};
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

export const ButtonWithLinkStyle = styled('button')`
  color: ${DesignTokenColors.primary500};
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

