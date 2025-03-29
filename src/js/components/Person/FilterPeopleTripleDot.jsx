import { MoreHoriz } from '@mui/icons-material';
import { Checkbox, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from '@mui/material';
import Popover from '@mui/material/Popover';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import DesignTokenColors from '../../common/components/Style/DesignTokenColors';
import { renderLog } from '../../common/utils/logging';
import { useConnectAppContext } from '../../contexts/ConnectAppContext';
import { viewerCanSeeOrDo } from '../../models/AuthModel';


const FilterPeopleTripleDot = ({ classes }) => { // teamId
  renderLog('FilterPeopleTripleDot');  // Set LOG_RENDER_EVENTS to log all renders
  const { apiDataCache, getAppContextValue, setAppContextValue } = useConnectAppContext();
  const { viewerAccessRights } = apiDataCache;

  const [anchorEl, setAnchorEl] = useState(null);
  const [viewerIsOnHrTeam, setViewerIsOnHrTeam] = useState(false);

  useEffect(() => {
    setViewerIsOnHrTeam(viewerCanSeeOrDo(['canEditPersonAnyone'], viewerAccessRights));
  }, [viewerAccessRights]);

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const onDotButtonClick = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const uncheckAllOnlyOptions = () => {
    setAppContextValue('isInternPeopleFilter', false);
    setAppContextValue('isHiringManagerPeopleFilter', false);
    setAppContextValue('isTeamLeadPeopleFilter', false);
    setAppContextValue('statusOnLeavePeopleFilter', false);
    setAppContextValue('statusResignedPeopleFilter', false);
    setAppContextValue('statusInOfferProcessPeopleFilter', false);
  };

  useEffect(() => {
    if (getAppContextValue('includeOrOnlyPeopleFilter') === null || getAppContextValue('includeOrOnlyPeopleFilter') === undefined) {
      setAppContextValue('includeOrOnlyPeopleFilter', 'INCLUDE');
    }
    if (getAppContextValue('statusInOfferProcessPeopleFilter') === null || getAppContextValue('statusInOfferProcessPeopleFilter') === undefined) {
      setAppContextValue('statusInOfferProcessPeopleFilter', true);
    }
  }, []);

  // const canEditPerson = viewerCanSeeOrDo(['canEditPersonAnyone'], viewerAccessRights) || viewerCanSeeOrDoForThisTeam('canEditPersonThisTeam', teamId, viewerTeamAccessRights);
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;
  return (
    <FilterPeopleTripleDotWrapper>
      <TripleDotButton type="button" aria-label="source" onClick={onDotButtonClick}>
        <MoreHoriz />
      </TripleDotButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <PopoverWrapper>
          <FormControl>
            <FormLabel id="includeOrOnlyId">SHOW</FormLabel>
            <RadioGroup
              aria-labelledby="includeOrOnlyId"
              value={getAppContextValue('includeOrOnlyPeopleFilter')}
              name="includeOrOnly"
              onChange={(event) => {
                setAppContextValue('includeOrOnlyPeopleFilter', event.target.value);
              }}
              row
              sx={{ paddingBottom: '20px' }}
            >
              <FormControlLabel
                control={<Radio />}
                key="includeKey"
                label="Include"
                value="INCLUDE"
              />
              <FormControlLabel
                control={<Radio />}
                key="onlyKey"
                label="Only"
                value="ONLY"
              />
            </RadioGroup>
          </FormControl>
          <FormControl classes={{ root: classes.formControl }}>
            <CheckboxLabel
              classes={viewerIsOnHrTeam ? { label: classes.checkboxLabel } : { root: classes.hideThisField }}
              control={(
                <Checkbox
                  checked={getAppContextValue('statusInOfferProcessPeopleFilter') || false}
                  className={classes.checkboxRoot}
                  color="primary"
                  id="statusInOfferProcessPeopleFilterId"
                  name="statusInOfferProcessPeopleFilter"
                  onChange={(event) => {
                    if (getAppContextValue('includeOrOnlyPeopleFilter') === 'ONLY' && event.target.checked) {
                      uncheckAllOnlyOptions();
                    }
                    setAppContextValue('statusInOfferProcessPeopleFilter', event.target.checked);
                  }}
                />
              )}
              // label={`In Offer Process (${webAppConfig.ORGANIZATION_NAME})`}
              label="In Offer Process (3)"
            />
            <CheckboxLabel
              classes={viewerIsOnHrTeam ? { label: classes.checkboxLabel } : { root: classes.hideThisField }}
              control={(
                <Checkbox
                  checked={getAppContextValue('statusOnLeavePeopleFilter') || false}
                  className={classes.checkboxRoot}
                  color="primary"
                  id="statusOnLeavePeopleFilterId"
                  name="statusOnLeavePeopleFilter"
                  onChange={(event) => {
                    if (getAppContextValue('includeOrOnlyPeopleFilter') === 'ONLY' && event.target.checked) {
                      uncheckAllOnlyOptions();
                    }
                    setAppContextValue('statusOnLeavePeopleFilter', event.target.checked);
                  }}
                />
              )}
              // label={`On Leave (${webAppConfig.ORGANIZATION_NAME})`}
              label="On Leave (12)"
            />
            <CheckboxLabel
              classes={viewerIsOnHrTeam ? { label: classes.checkboxLabel } : { root: classes.hideThisField }}
              control={(
                <Checkbox
                  checked={getAppContextValue('statusResignedPeopleFilter') || false}
                  className={classes.checkboxRoot}
                  color="primary"
                  id="statusResignedPeopleFilterId"
                  name="statusResignedPeopleFilter"
                  onChange={(event) => {
                    if (getAppContextValue('includeOrOnlyPeopleFilter') === 'ONLY' && event.target.checked) {
                      uncheckAllOnlyOptions();
                    }
                    setAppContextValue('statusResignedPeopleFilter', event.target.checked);
                  }}
                />
              )}
              // label={`Resigned (${webAppConfig.ORGANIZATION_NAME})`}
              label="Resigned (5)"
            />
            <CheckboxLabel
              classes={getAppContextValue('includeOrOnlyPeopleFilter') === 'ONLY' ? { label: classes.checkboxLabel } : { root: classes.hideThisField }}
              control={(
                <Checkbox
                  checked={getAppContextValue('isTeamLeadPeopleFilter') || false}
                  className={classes.checkboxRoot}
                  color="primary"
                  id="isTeamLeadPeopleFilterId"
                  name="isTeamLeadPeopleFilter"
                  onChange={(event) => {
                    if (getAppContextValue('includeOrOnlyPeopleFilter') === 'ONLY' && event.target.checked) {
                      uncheckAllOnlyOptions();
                    }
                    setAppContextValue('isTeamLeadPeopleFilter', event.target.checked);
                  }}
                />
              )}
              // label={`Team Leads (${webAppConfig.ORGANIZATION_NAME})`}
              label="Team Leads (7)"
            />
            <CheckboxLabel
              classes={getAppContextValue('includeOrOnlyPeopleFilter') === 'ONLY' ? { label: classes.checkboxLabel } : { root: classes.hideThisField }}
              control={(
                <Checkbox
                  checked={getAppContextValue('isHiringManagerPeopleFilter') || false}
                  className={classes.checkboxRoot}
                  color="primary"
                  id="isHiringManagerPeopleFilterId"
                  name="isHiringManagerPeopleFilter"
                  onChange={(event) => {
                    if (getAppContextValue('includeOrOnlyPeopleFilter') === 'ONLY' && event.target.checked) {
                      uncheckAllOnlyOptions();
                    }
                    setAppContextValue('isHiringManagerPeopleFilter', event.target.checked);
                  }}
                />
              )}
              // label={`Team Leads (${webAppConfig.ORGANIZATION_NAME})`}
              label="Hiring Managers (7)"
            />
            <CheckboxLabel
              classes={getAppContextValue('includeOrOnlyPeopleFilter') === 'ONLY' ? { label: classes.checkboxLabel } : { root: classes.hideThisField }}
              control={(
                <Checkbox
                  checked={getAppContextValue('isInternPeopleFilter') || false}
                  className={classes.checkboxRoot}
                  color="primary"
                  id="isInternPeopleFilterId"
                  name="isInternPeopleFilter"
                  onChange={(event) => {
                    if (getAppContextValue('includeOrOnlyPeopleFilter') === 'ONLY' && event.target.checked) {
                      uncheckAllOnlyOptions();
                    }
                    setAppContextValue('isInternPeopleFilter', event.target.checked);
                  }}
                />
              )}
              label="Interns (23)"
            />
          </FormControl>
        </PopoverWrapper>
      </Popover>
    </FilterPeopleTripleDotWrapper>
  );
};
FilterPeopleTripleDot.propTypes = {
  classes: PropTypes.object.isRequired,
  // teamId: PropTypes.number,
};

const styles = () => ({
  checkboxLabel: {
    marginTop: 2,
  },
  formControl: {
    width: '100%',
  },
  hideThisField: {
    position: 'absolute',
    left: '-9999px',
    width: '1px',
    height: '1px',
    overflow: 'hidden',
  },
});

const CheckboxLabel = styled(FormControlLabel)`
  margin-bottom: 0 !important;
`;

const FilterPeopleTripleDotWrapper = styled('div')`
  color: ${DesignTokenColors.neutral900};
  :hover {
    color: ${DesignTokenColors.neutral400};
    cursor: pointer;
  }
`;

const PopoverWrapper = styled('div')`
  padding: 5px;
`;

const TripleDotButton = styled('button')`
  background: transparent;
  border: 0;
  margin-right: -3px;
  padding-right: 0;
`;

export default withStyles(styles)(FilterPeopleTripleDot);
