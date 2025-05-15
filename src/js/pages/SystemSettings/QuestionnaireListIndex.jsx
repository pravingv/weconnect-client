import { Button } from '@mui/material';
import { withStyles } from '@mui/styles';
import { useQueryClient } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';
import { EditStyled } from '../../components/Style/iconStyles';
import { SpanWithLinkStyle } from '../../components/Style/linkStyles';
import { PageContentContainer } from '../../components/Style/pageLayoutStyles';
import { useConnectAppContext, useConnectDispatch } from '../../contexts/ConnectAppContext';
import { viewerCanSeeOrDo } from '../../models/AuthModel';
import capturePersonListRetrieveData from '../../models/capturePersonListRetrieveData';
import { captureQuestionnaireListRetrieveData } from '../../models/QuestionnaireModel';
import CopyQuestionnaireLink from '../../components/Questionnaire/CopyQuestionnaireLink';
import { METHOD, useFetchData } from '../../react-query/WeConnectQuery';


const QuestionnaireListIndex = ({ classes, showQuestionnaireList }) => {
  renderLog('QuestionnaireListIndex');
  const { apiDataCache, setAppContextValue } = useConnectAppContext();
  const { viewerAccessRights, allPeopleCache, allQuestionnairesCache } = apiDataCache;
  const dispatch = useConnectDispatch();

  const [questionnaireList, setQuestionnaireList] = useState([]);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const personListRetrieveResults = useFetchData(['person-list-retrieve'], {}, METHOD.GET);
  useEffect(() => {
    if (personListRetrieveResults) {
      capturePersonListRetrieveData(personListRetrieveResults, apiDataCache, dispatch);
    }
  }, [personListRetrieveResults, allPeopleCache, apiDataCache, dispatch]);

  const questionnaireListRetrieveResults = useFetchData(['questionnaire-list-retrieve'], {}, METHOD.GET);
  useEffect(() => {
    if (questionnaireListRetrieveResults) {
      captureQuestionnaireListRetrieveData(questionnaireListRetrieveResults, apiDataCache, dispatch);
    }
  }, [questionnaireListRetrieveResults, allQuestionnairesCache, apiDataCache, dispatch]);

  useEffect(() => {
    if (allQuestionnairesCache) {
      setQuestionnaireList(Object.values(allQuestionnairesCache));
    }
  }, [allQuestionnairesCache]);

  const addQuestionnaireClick = () => {
    setAppContextValue('editQuestionnaireDrawerOpen', true);
    setAppContextValue('selectedQuestionnaire', undefined);
    setAppContextValue('editQuestionnaireDrawerLabel', 'Add Questionnaire');
  };

  const editQuestionnaireClick = (questionnaire) => {
    setAppContextValue('editQuestionnaireDrawerOpen', true);
    setAppContextValue('selectedQuestionnaire', questionnaire);
    setAppContextValue('editQuestionnaireDrawerLabel', 'Edit Questionnaire');
  };

  const goToQuestionnairePageClick = (questionnaire) => {
    setAppContextValue('selectedQuestionnaire', questionnaire);

    queryClient.invalidateQueries(['question-list-retrieve']).then(() => {});
    // console.log('goToQuestionnairePageClick = (questionnaire)', questionnaire.questionnaireId);

    navigate(`/questionnaire/${questionnaire.questionnaireId}`);
  };

  if (!viewerCanSeeOrDo(['canViewSystemSettings'], viewerAccessRights)) {
    return (
      <PageContentContainer>
        <h1>You do not have permission to access this page.</h1>
      </PageContentContainer>
    );
  }

  // Alphabetically sort questionnaires and task groups
  questionnaireList.sort((a, b) => a.questionnaireName.localeCompare(b.questionnaireName));
  return (
    <QuestionnaireListIndexWrapper>
      {showQuestionnaireList && (
        <DisplayArea>
          {questionnaireList.map((questionnaire) => (
            <OneQuestionnaireWrapper key={`questionnaire-${questionnaire.questionnaireId}`}>
              <ListItemFlexInnerWrapper>
                {/* {console.log('questionnaireList.map((questionnaire)', questionnaire.questionnaireId)} */}
                <GoToQuestionnairePage onClick={() => goToQuestionnairePageClick(questionnaire)}>
                  <SpanWithLinkStyle>
                    {questionnaire.questionnaireName} ({questionnaire.questionnaireId})
                  </SpanWithLinkStyle>
                </GoToQuestionnairePage>
                {questionnaire.isCreatePersonQuestionnaire && (
                  <CopyQuestionnaireWrapper>
                    <CopyQuestionnaireLink questionnaireId={questionnaire.questionnaireId} />
                  </CopyQuestionnaireWrapper>
                )}
                <EditQuestionnaire onClick={() => editQuestionnaireClick(questionnaire)}>
                  <EditStyled />
                </EditQuestionnaire>
              </ListItemFlexInnerWrapper>
            </OneQuestionnaireWrapper>
          ))}
          <AddButtonWrapper>
            <Button
              classes={{ root: classes.addQuestionnaireButtonRoot }}
              color="primary"
              variant="outlined"
              onClick={addQuestionnaireClick}
            >
              Add Questionnaire
            </Button>
          </AddButtonWrapper>
        </DisplayArea>
      )}
    </QuestionnaireListIndexWrapper>
  );
};
QuestionnaireListIndex.propTypes = {
  classes: PropTypes.object.isRequired,
  showQuestionnaireList: PropTypes.bool,
};

const styles = (theme) => ({
  ballotButtonIconRoot: {
    marginRight: 8,
  },
  addQuestionnaireButtonRoot: {
    width: 185,
    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
  },
});

const AddButtonWrapper = styled('div')`
  margin-top: 24px;
`;

const CopyQuestionnaireWrapper = styled('div')`
  cursor: pointer;
  margin-left: 18px;
`;

const DisplayArea = styled('div')`
`;

const EditQuestionnaire = styled('div')`
  cursor: pointer;
  margin-left: 25px;
`;

const GoToQuestionnairePage = styled('div')`
`;

const OneQuestionnaireWrapper = styled('div')`
`;

const ListItemFlexInnerWrapper = styled('div')`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 6px;
`;

const QuestionnaireListIndexWrapper = styled('div')`
`;

export default withStyles(styles)(QuestionnaireListIndex);
