import styled from 'styled-components';
import standardBoxShadow from '../../common/components/Style/standardBoxShadow';
import { hasDynamicIsland, isIPhone5p5inMini } from '../../common/utils/cordovaUtils';
import { isWebApp } from '../../common/utils/isCordovaOrWebApp';
import { cordovaBallotFilterTopMargin } from '../../utils/cordovaOffsets';


export const IOSNotchedSpacer = styled('div')`
  height: ${() => {
    if (isIPhone5p5inMini())      return '40px';
    if (hasDynamicIsland())       return '52px';
    return                        '36px';
  }};
  top: 0;
  position: fixed;
  background: white;
  width: 100%;
  opacity: 1;
  z-index: 1300;
`;

export const IOSNoNotchSpacer = styled('div')`
  height: 36px;
  position: fixed;
  //background: white;
  width: 100%;
  opacity: 0;
  z-index: 3;
`;

function getPaddingTop () {
  return '';
}

function getPaddingBottom () {
  return '';
}

export const PageContentContainer = styled('div')(({ theme }) => (`
  margin: 0 auto;
  max-width: 960px;
  min-height: 190px;
  padding-top: 55px; // Temp fix
  // padding-top: ${getPaddingTop()};
  padding-bottom: ${getPaddingBottom()};
  position: relative;
  z-index: 0;
  ${theme.breakpoints.down('sm')} {
    min-height: ${isWebApp() ? '10px' : `${window.innerHeight}px`};
    margin: ${isWebApp() ? '0 !important' : '24px 10px'};  // From Dale: Let's discuss this
  }
`));

export const PageContentContainerGetStarted = styled('div')`
  background-color: white;
  display: flex;
  justify-content: center;
`;

export const HeaderContentContainer = styled('div')(({ theme }) => (`
  margin: ${() => cordovaBallotFilterTopMargin()} auto 0 auto;
  position: relative;
  max-width: 960px;
  width: 100%;
  z-index: 0;
  ${theme.breakpoints.down('sm')} {
    min-height: 10px;
    //margin: 0 10px;
  }
`));


export const HeaderContentOuterContainer = styled('div')`
  display: flex;
  justify-content: center;
  width: 100%;
`;

export const DualHeaderContainer = styled('div', {
  shouldForwardProp: (prop) => !['scrolledDown'].includes(prop),
})(({ scrolledDown }) => (`
  // padding-top: cordovaDualHeaderContainerPadding()
  width: 100%;
  background-color: #fff;
  ${scrolledDown ? 'border-bottom: 1px solid #aaa' : ''};
  ${scrolledDown ? `box_shadow: ${standardBoxShadow('wide')}` : ''};
  overflow: hidden;
  position: fixed;
  z-index: 1;
  left: 0;
`));

export const HeadroomWrapper = styled('div')`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background: white;
  z-index: 2;
`;

export const TopOfPageHeader = styled('div')`
  width: 100%;
  max-width: 960px;
  justify-content: space-between;
  display: grid;
  grid-template-columns: auto auto auto;
  height: fit-content;
  margin: auto;
`;

export const TopRowOneLeftContainer = styled('div')`
   grid-row-start: 1;
   grid-row-end: 1;
   grid-column: 1 / 2;
`;

export const TopRowOneMiddleContainer = styled('div')`
  grid-row-start: 1;
  grid-row-end: 1;
  grid-column: 2 / 3;
`;

export const TopRowOneRightContainer = styled('div')`
  display: flex;
  justify-content: flex-end;
  cursor: pointer;
`;

export const TopRowTwoLeftContainer = styled('div')`
  grid-row-start: 2;
  grid-row-end: 3;
  grid-column: 1 / 3;
  padding-bottom: 7px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const CirclePicture = styled('img')`
  border-radius: 50%;
  object-fit: cover;
`;

export const CloseDrawerIconWrapper = styled('div')`
  display: flex;
  justify-content: flex-end;
  padding-right: 10px;     // For when the pane becomes scrollable, so the x stays in the pane
`;
