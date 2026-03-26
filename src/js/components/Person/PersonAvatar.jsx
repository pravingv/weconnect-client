import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import React from 'react';
import { CirclePicture } from '../Style/pageLayoutStyles';

export default function PersonAvatar (params) {
  const { isAuthenticated, slackImage, styles } = params;

  if (isAuthenticated) {
    if (slackImage) {
      return <CirclePicture style={styles} id="myImage" src={slackImage} />;
    } else {
      return <AccountCircleIcon />;
    }
  }
  return 'Sign In';
}
