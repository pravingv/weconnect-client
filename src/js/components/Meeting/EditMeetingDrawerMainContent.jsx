import React from 'react';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';
import EditMeetingForm from './EditMeetingForm';


const EditMeetingDrawerMainContent = () => {
  renderLog('EditMeetingDrawerMainContent');

  return (
    <EditMeetingDrawerMainContentWrapper>
      <AddMeetingWrapper>
        <EditMeetingForm />
      </AddMeetingWrapper>
    </EditMeetingDrawerMainContentWrapper>
  );
};

const EditMeetingDrawerMainContentWrapper = styled('div')`
`;

const AddMeetingWrapper = styled('div')`
  margin-top: 32px;
`;

export default EditMeetingDrawerMainContent;
