import { Button } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import LockIcon from '@mui/icons-material/Lock';
import CampaignIcon from '@mui/icons-material/Campaign';
import MenuIcon from '@mui/icons-material/Menu';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import styled from 'styled-components';
import DrawerTemplateProfile from './DrawerTemplateProfile';
import DesignTokenColors from '../../common/components/Style/DesignTokenColors';
import { clearSignedInGlobals } from '../../contexts/contextFunctions';
import { useConnectAppContext } from '../../contexts/ConnectAppContext';
import EditPersonDrawerMainContent from '../Person/EditPersonDrawerMainContent';
import weConnectQueryFn, { METHOD } from '../../react-query/WeConnectQuery';
import { useLogoutMutation } from '../../react-query/mutations';

const EditProfileDrawer = () => {
  const [headerFixedJsx] = useState(<></>);
  const [displayProfileOption, setDisplayProfileOption] = useState('nameAndPhoto');
  const [displayProfileComponent, setDisplayProfileComponent] = useState();
  const [showLinksToProfilePages, setShowLinksToProfilePages] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const { setAppContextValue, getAppContextData } = useConnectAppContext();
  const { mutate: mutateLogout } = useLogoutMutation();
  const navigate = useNavigate();

  // checks window width for responsiveness
  useEffect(() => {
    const handleWindowWidth = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleWindowWidth);
    return () => window.removeEventListener('resize', handleWindowWidth);
  }, []);

  // useEffect to handle which component to display from nav
  useEffect(() => {
    let component;
    switch (displayProfileOption) {
      case 'nameAndPhoto':
        component = <EditPersonDrawerMainContent />;
        break;
      case 'securityAndSignIn':
        component = <h1>Security & Sign In</h1>;
        break;
      case 'notifications':
        component = <h1>Notifications</h1>;
        break;
      default:
        component = <EditPersonDrawerMainContent />;
    }
    setDisplayProfileComponent(component);
  }, [displayProfileOption]);

  const profileNavOptions = [
    { icon: <AccountBoxIcon />, linkName: 'nameAndPhoto', linkTextJsx: <>Name & Photo</> },
    { icon: <LockIcon />, linkName: 'securityAndSignIn', linkTextJsx: <>Security & Sign In</> },
    { icon: <CampaignIcon />, linkName: 'notifications', linkTextJsx: <>Notifications</> },
  ];

  const onNavLinkClick = (linkName) => {
    setDisplayProfileOption(linkName);
    setShowLinksToProfilePages(false);
  };

  const signOutApi = async () => {
    // I don't think we want to make the weConnectQueryFn call here since we are about to call mutateLogout
    const data = await weConnectQueryFn('logout', {}, METHOD.POST);
    console.log('signOutApi in HeaderBar data: ', data);
    // console.log(`/logout response in HeaderBar -- status: '${'status'}',  data: ${JSON.stringify(data)}`);
    clearSignedInGlobals(setAppContextValue, getAppContextData);
    navigate('/login');
    mutateLogout();
    setAppContextValue('editProfileDrawerOpen', false);
  };

  const linksToProfilePages = profileNavOptions.map((option) => (
    <NavLinkContainer
      isActive={displayProfileOption === option.linkName}
      onClick={() => onNavLinkClick(option.linkName)}
      key={option.linkName}
    >
      {option.icon}
      <NavLink>
        {option.linkTextJsx}
      </NavLink>
    </NavLinkContainer>
  ));

  const SignOutJsx = (
    <div>
      <Button
        variant="outlined"
        sx={{ border: 'none' }}
        id="signOutButton"
        onClick={() => signOutApi()}
      >
        Sign Out
      </Button>
    </div>
  );

  // main content logic for mobile or desktop
  const mainContentJsx = (
    <EditProfileDrawerWrapper>
      {windowWidth < 768 ? (
        <>
          {showLinksToProfilePages ? (
            <NavLinksContainer>
              {linksToProfilePages}
              {SignOutJsx}
            </NavLinksContainer>
          ) : (
            <>
              <LinkComponentContainer>{displayProfileComponent}</LinkComponentContainer>
            </>
          )}
        </>
      ) : (
        <>
          <NavLinksContainer>
            {linksToProfilePages}
            {SignOutJsx}
          </NavLinksContainer>
          <div>
            <LinkComponentContainer>{displayProfileComponent}</LinkComponentContainer>
          </div>
        </>
      )}
    </EditProfileDrawerWrapper>
  );

  const headerTitleJSX = (
    <>
      {!showLinksToProfilePages && (
        <MenuIconWrapper onClick={() => setShowLinksToProfilePages(true)}>
          <MenuIcon />
        </MenuIconWrapper>
      )}
      <YourAccountWrapper>
        <AccountCircleIcon />
        <p>Your account</p>
      </YourAccountWrapper>
    </>
  );
  return (
    <DrawerTemplateProfile
      drawerId="editProfileDrawer"
      drawerOpenGlobalVariableName="editProfileDrawerOpen"
      headerTitleJsx={headerTitleJSX}
      headerFixedJsx={headerFixedJsx}
      mainContentJsx={mainContentJsx}
    />
  );
};

const MenuIconWrapper = styled.button`
  display: none;

  @media (max-width: 768px) {
    align-items: center;
    border: none;
    color: ${DesignTokenColors.whiteUI};
    background: transparent;
    display: flex;
    border-right: 1px solid ${DesignTokenColors.whiteUI};
    justify-content: center;
    margin-right: 8px;
    padding: 4px 16px 4px 4px;
  }
`;

const YourAccountWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-around;
  width: 180px;
`;

const EditProfileDrawerWrapper = styled.div`
  display: flex;
  gap: 32px;
  margin-top: 16px;
`;

const NavLinksContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: -16px;
`;

const LinkComponentContainer = styled.div`
  width: 100%;
`;

const NavLinkContainer = styled.div`
  align-items: center;
  background: ${(props) => (props.isActive ? `${DesignTokenColors.primary50}` : 'transparent')};
  border-left: ${(props) => (props.isActive ? `4px solid ${DesignTokenColors.primary600}` : '4px solid transparent')};
  border-radius: 0 20px 20px 0;
  color: ${(props) => (props.isActive ? `${DesignTokenColors.primary600}` : `${DesignTokenColors.neutralUI600}`)};
  cursor: pointer;
  display: flex;
  height: 40px;
  padding-left: 16px;
  width: 210px;

  @media (max-width: 768px) {
    background: transparent;
    border-left: none;
    color: ${DesignTokenColors.neutralUI600};
  }
`;

const NavLink = styled.p`
  margin-left: 16px;
`;

export default EditProfileDrawer;
