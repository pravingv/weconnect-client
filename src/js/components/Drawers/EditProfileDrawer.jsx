import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import LockIcon from '@mui/icons-material/Lock';
import CampaignIcon from '@mui/icons-material/Campaign';
import MenuIcon from '@mui/icons-material/Menu';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import DrawerTemplateProfile from './DrawerTemplateProfile';
import DesignTokenColors from '../../common/components/Style/DesignTokenColors';
import EditPersonDrawerMainContent from '../Person/EditPersonDrawerMainContent';

const EditProfileDrawer = () => {
  const [headerFixedJsx] = useState(<></>);
  const [displayProfileOption, setDisplayProfileOption] = useState('Name & Photo');
  const [displayProfileComponent, setDisplayProfileComponent] = useState();
  const [viewLink, setViewLink] = useState(false);
  const [headerTitleJSX] = useState(<><MenuIconWrapper onClick={() => setViewLink(true)}><MenuIcon /></MenuIconWrapper><YourAccountWrapper><AccountCircleIcon /><p>Your account</p></YourAccountWrapper></>);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
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
      case 'Name & Photo':
        component = <EditPersonDrawerMainContent />;
        break;
      case 'Security & Sign In':
        component = <h1>Security & Sign In</h1>;
        break;
      case 'Notifications':
        component = <h1>Notifications</h1>;
        break;
      default:
        component = <EditPersonDrawerMainContent />;
    }
    setDisplayProfileComponent(component);
  }, [displayProfileOption]);

  const profileNavOptions = [
    { icon: <AccountBoxIcon />, link: 'Name & Photo' },
    { icon: <LockIcon />, link: 'Security & Sign In' },
    { icon: <CampaignIcon />, link: 'Notifications' },
  ];

  const onNavLinkClick = (link) => {
    setDisplayProfileOption(link);
    setViewLink(true);
  };

  const navOptionsComponent = profileNavOptions.map((option) => (
    <NavLinkContainer
      isactive={displayProfileOption === option.link}
      onClick={() => onNavLinkClick(option.link)}
      key={option.link}
    >
      {option.icon}
      <NavLink>
        {option.link}
      </NavLink>
    </NavLinkContainer>
  ));
  // main content logic for mobile or desktop
  const mainContentJsx = (
    <EditProfileDrawerWrapper>
      {windowWidth < 768 ? (
        <>
          {!viewLink ? (
            <NavLinksContainer>{navOptionsComponent}</NavLinksContainer>
          ) : (
            <LinkComponentContainer>{displayProfileComponent}</LinkComponentContainer>
          )}
        </>
      ) : (
        <>
          <NavLinksContainer>{navOptionsComponent}</NavLinksContainer>
          <LinkComponentContainer>{displayProfileComponent}</LinkComponentContainer>
        </>
      )}
    </EditProfileDrawerWrapper>
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
  background: ${(props) => (props.isactive ? `${DesignTokenColors.primary50}` : 'transparent')};
  border-left: ${(props) => (props.isactive ? `4px solid ${DesignTokenColors.primary600}` : '4px solid transparent')};
  border-radius: 0 20px 20px 0;
  color: ${(props) => (props.isactive ? `${DesignTokenColors.primary600}` : `${DesignTokenColors.neutralUI600}`)};
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
