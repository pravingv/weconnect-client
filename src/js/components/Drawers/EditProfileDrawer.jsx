import React, { useState } from 'react';
import DrawerTemplateA from "./DrawerTemplateA";

const EditProfileDrawer = () => {
  const [headerTitleJSX] = useState(<></>);
  const [headerFixedJsx] = useState(<></>);

  return (
    <DrawerTemplateA
      drawerId="editProfileDrawer"
      drawerOpenGlobalVariableName="editProfileDrawerOpen"
      headerTitleJsx={headerTitleJSX}
      headerFixedJsx={headerFixedJsx}
      mainContentJsx={<h1>Edit Profile Content</h1>}
    />
  );
};

export default EditProfileDrawer;
