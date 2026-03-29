import withStyles from '@mui/styles/withStyles';
import React, { Component, Suspense } from 'react';
import styled from 'styled-components';
import { normalizedHref } from '../../common/utils/hrefUtils';
import { isWebApp } from '../../common/utils/isCordovaOrWebApp';
import { renderLog } from '../../common/utils/logging';
import { handleResize } from '../../common/utils/isMobileScreenSize';
import { getApplicationViewBooleans } from '../../utils/applicationUtils';
// importRemoveCordovaListenersToken2  -- Do not remove this line!


const DelayedLoad = React.lazy(() => import(/* webpackChunkName: 'DelayedLoad' */ '../../common/components/Widgets/DelayedLoad'));

// Wrapper component for all footers
class Footer extends Component {
  constructor (props) {
    super(props);
    this.state = {
      previousPathname: '',
      showFooterBar: false,
      showFooterMain: false,
      showShareButtonFooter: false,
    };
    this.handleResizeLocal = this.handleResizeLocal.bind(this);
  }

  componentDidMount () {
    // console.log('Footer componentDidMount');
    window.addEventListener('scroll', this.handleWindowScroll);
    window.addEventListener('resize', this.handleResizeLocal);
    this.updateCachedSiteVars();
  }

  componentDidCatch (error, info) {
    // We should get this information to Splunk!
    console.error('Footer caught error: ', `${error} with info: `, info);
  }

  componentWillUnmount () {
    this.appStateSubscription.unsubscribe();
    window.removeEventListener('scroll', this.handleWindowScroll);
    window.removeEventListener('resize', this.handleResizeLocal);
    // removeCordovaListenersToken -- Do not remove this line!
  }

  handleWindowScroll = (/* evt */) => {
    // const { scrollTop } = evt.target.scrollingElement;
    // if (scrollTop > 60 && !AppObservableStore.getScrolledDown()) {
    //   AppObservableStore.setScrolled(true);
    // }
    // if (scrollTop < 60 && AppObservableStore.getScrolledDown()) {
    //   AppObservableStore.setScrolled(false);
    // }
  };

  handleResizeLocal () {
    if (handleResize('Footer')) {
      // console.log('Footer handleResizeEntry update');
      this.updateCachedSiteVars();
    }
  }

  // onAppObservableStoreChange () {
  //   // console.log('Footer onAppObservableStoreChange');
  //   const siteVars = getApplicationViewBooleans(normalizedHref());
  //   // console.log('Footer onAppObservableStoreChange siteVars:', siteVars);
  //   const {
  //     showFooterBar,
  //     showFooterMain,
  //     showShareButtonFooter,
  //   } = siteVars;
  //   const pathname = normalizedHref();
  //   const {
  //     previousPathname,
  //     showFooterBar: previousShowFooterBar,
  //     showFooterMain: previousShowFooterMain,
  //     showShareButtonFooter: previousShowShareButtonFooter,
  //   } = this.state;
  //   if (previousPathname !== pathname) {
  //     this.setState({
  //       previousPathname: pathname,
  //       showFooterBar,
  //       showFooterMain,
  //       showShareButtonFooter,
  //     });
  //   } else {
  //     if (previousShowFooterBar !== showFooterBar) {
  //       this.setState({
  //         showFooterBar,
  //       });
  //     }
  //     if (previousShowFooterMain !== showFooterMain) {
  //       this.setState({
  //         showFooterMain,
  //       });
  //     }
  //     if (previousShowShareButtonFooter !== showShareButtonFooter) {
  //       this.setState({
  //         showShareButtonFooter,
  //       });
  //     }
  //   }
  // }

  updateCachedSiteVars () {
    const siteVars = getApplicationViewBooleans(normalizedHref());
    // console.log('Footer componentDidMount siteVars:', siteVars);
    const { showFooterBar, showFooterMain, showShareButtonFooter } = siteVars;
    const pathname = normalizedHref();
    this.setState({
      previousPathname: pathname,
      showFooterBar,
      showFooterMain,
      showShareButtonFooter,
    });
  }

  render () {
    renderLog('Footer');  // Set LOG_RENDER_EVENTS to log all renders
    const { /* doShowHeader, doShowFooter, */ showFooterBar, showFooterMain } = this.state;
    // console.log('Footer render showFooterMain:', showFooterMain);
    return (
      <FooterWrapper id="footer">
        {(showFooterMain) && (
          <FooterMainWrapper>
            <Suspense fallback={<span>&nbsp;</span>}>
              <DelayedLoad waitBeforeShow={1000}>
                <div>== FooterMain Here ==</div>
              </DelayedLoad>
            </Suspense>
          </FooterMainWrapper>
        )}
        {showFooterBar && (
          <FooterBarWrapper className={isWebApp() ? 'footroom-wrapper' : 'footroom-wrapper-cordova'}>
            <Suspense fallback={<span>&nbsp;</span>}>
              <div>== FooterBar Here ==</div>
            </Suspense>
          </FooterBarWrapper>
        )}
      </FooterWrapper>
    );
  }
}

const styles = () => ({
});

const FooterBarWrapper = styled('div')`
`;

const FooterMainWrapper = styled('div')`
`;

const FooterWrapper = styled('div')`
  // In Cordova, display=none, can be set in prepareForCordovaKeyboard()
`;

export default withStyles(styles)(Footer);
