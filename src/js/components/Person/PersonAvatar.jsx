import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import React from 'react';
import { CirclePicture } from '../Style/pageLayoutStyles';
import DesignTokenColors from '../../common/components/Style/DesignTokenColors';

export default function PersonAvatar (params) {
  const { id, isAuthenticated, onClick, slackImage, styles } = params;

  if (isAuthenticated) {
    if (slackImage) {
      return (
        <CirclePicture
          id={id}
          onClick={onClick}
          src={slackImage}
          style={styles}
        />
      );
    } else {
      return (
        <AccountCircleIcon
          id={id}
          onClick={onClick}
          style={styles}
          sx={{ color: DesignTokenColors.neutralUI600 }}
        />
      );
    }
  }
  return 'Sign In';
}
