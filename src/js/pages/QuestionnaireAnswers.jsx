import { FormControl, TextField } from '@mui/material';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router';
import styled from 'styled-components';
import DesignTokenColors from '../common/components/Style/DesignTokenColors';
import { renderLog } from '../common/utils/logging';
import { PageContentContainer } from '../components/Style/pageLayoutStyles';
import webAppConfig from '../config';
import { useConnectAppContext, useConnectDispatch } from '../contexts/ConnectAppContext';
import { useGetFullNamePreferred } from '../models/PersonModel';
import capturePersonListRetrieveData from '../models/capturePersonListRetrieveData';
import {
  captureAnswerListRetrieveData,
  captureQuestionListRetrieveData,
  captureQuestionnaireListRetrieveData,
  getAnswerValueToQuestion,
  getQuestionsForQuestionnaire,
} from '../models/QuestionnaireModel';
import { METHOD, useFetchData } from '../react-query/WeConnectQuery';


const QuestionnaireAnswers = ({ classes }) => {
  renderLog('QuestionnaireAnswers');
  const { apiDataCache } = useConnectAppContext();
  const { allAnswersCache, allPeopleCache, allQuestionnairesCache, allQuestionsCache } = apiDataCache;
  const dispatch = useConnectDispatch();

  const [personId] = useState(parseInt(useParams().personId));
  const [questionList, setQuestionList] = useState(undefined);
  const [questionnaire, setQuestionnaire] = useState({});
  const [questionnaireId] = useState(parseInt(useParams().questionnaireId));

  const personListRetrieveResults = useFetchData(['person-list-retrieve'], {}, METHOD.GET);
  useEffect(() => {
    if (personListRetrieveResults) {
      capturePersonListRetrieveData(personListRetrieveResults, apiDataCache, dispatch);
    }
  }, [personListRetrieveResults, allPeopleCache, dispatch]);

  const questionListRetrieveResults = useFetchData(['question-list-retrieve'], { questionnaireId: questionnaireId || '-1' }, METHOD.GET);
  useEffect(() => {
    if (questionListRetrieveResults) {
      captureQuestionListRetrieveData(questionListRetrieveResults, apiDataCache, dispatch);
    }
  }, [questionListRetrieveResults, allQuestionsCache]);

  // OLD: const requestParams = `personIdList[]=${personId}`;
  const requestParams = {
    personIdList: [personId],
  };
  const answersListRetrieveResults = useFetchData(['questionnaire-responses-list-retrieve'], requestParams, METHOD.GET, true,
    { refetchInterval: 120000, refetchIntervalInBackground: false });
  useEffect(() => {
    if (answersListRetrieveResults) {
      captureQuestionnaireListRetrieveData(answersListRetrieveResults, apiDataCache, dispatch);
      captureAnswerListRetrieveData(answersListRetrieveResults, apiDataCache, dispatch);
    }
  }, [answersListRetrieveResults, apiDataCache, dispatch]);

  const sortQuestionsByOrder = (questions) => {
    return [...questions].sort((a, b) => a.questionOrder - b.questionOrder);
  };

  useEffect(() => {
    // console.log('useEffect in QuestionnaireAnswers questionnaireId:', questionnaireId);
    // console.log('allQuestionnairesCache:', allQuestionnairesCache);
    if (allQuestionnairesCache && allQuestionnairesCache[questionnaireId]) {
      setQuestionnaire(allQuestionnairesCache[questionnaireId]);
    }
  }, [allQuestionnairesCache, questionnaireId]);

  useEffect(() => {
    // console.log('useEffect in QuestionnaireAnswers (question-list-retrieve)');
    if (allQuestionsCache) {
      setQuestionList(sortQuestionsByOrder(getQuestionsForQuestionnaire(questionnaireId, allQuestionsCache)));
    }
  }, [allQuestionsCache]);

  const titleString = `${questionnaire.questionnaireName ? questionnaire.questionnaireName : 'Questionnaire Answers'} - ${webAppConfig.NAME_FOR_BROWSER_TAB_TITLE}`;
  return (
    <div>
      <Helmet>
        <title>
          {titleString}
        </title>
        <meta name="robots" content="noindex" data-react-helmet="true" />
      </Helmet>
      <PageContentContainer>
        {questionnaire.questionnaireName && (
          <TitleWrapper>
            {questionnaire.questionnaireName}
          </TitleWrapper>
        )}
        <AnsweredBy>
          Answered by:
          {' '}
          <AnsweredBySpan>{useGetFullNamePreferred(personId)}</AnsweredBySpan>
          {/* <AnsweredBySpan>{person ? getFullNamePreferredPerson(person) : 'tbd'}</AnsweredBySpan> */}
        </AnsweredBy>
        <FormControl classes={{ root: classes.formControl }}>
          {questionList && questionList.map((question) => (
            <OneQuestionWrapper key={`question-${question.id}`}>
              <QuestionText>
                {question.questionOrder + 1}
                .
                {' '}
                {question.questionText}
                {question.requireAnswer && <RequiredStar> *</RequiredStar>}
              </QuestionText>
              {question.questionInstructions && (
                <QuestionInstructions>
                  {question.questionInstructions}
                </QuestionInstructions>
              )}
              <QuestionFormWrapper>
                <TextField
                  classes={(question.answerType === 'INTEGER') ? {} : {
                    root: classes.inputFullWidth,
                  }}
                  disabled={false}
                  id={`questionAnswerToBeSaved-${question.id}`}
                  name={`questionAnswer-${question.id}`}
                  margin="dense"
                  variant="outlined"
                  placeholder={question.questionPlaceholder || ''}
                  value={getAnswerValueToQuestion(question.id, personId, allAnswersCache)}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </QuestionFormWrapper>
            </OneQuestionWrapper>
          ))}
        </FormControl>
      </PageContentContainer>
    </div>
  );
};
QuestionnaireAnswers.propTypes = {
  classes: PropTypes.object.isRequired,
};

const styles = (theme) => ({
  ballotButtonIconRoot: {
    marginRight: 8,
  },
  inputFullWidth: {
    width: '100%',
  },
  formControl: {
    width: '100%',
  },
  saveAnswersButton: {
    width: 300,
    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
  },
});

const AnsweredBy = styled('div')`
  align-content: center;
  font-size: 1.3em;
  font-weight: 300;
  margin-bottom: 16px;
`;

const AnsweredBySpan = styled('span')`
  font-weight: bold;
`;

const OneQuestionWrapper = styled('div')`
  border-top: 1px solid ${DesignTokenColors.neutralUI200};
  margin-top: 24px;
  padding-top: 6px;
`;

const QuestionInstructions = styled('div')`
  color: ${DesignTokenColors.neutralUI300};
`;

const QuestionFormWrapper = styled('div')`
  width: 100%;
`;

const QuestionText = styled('div')`
`;

const RequiredStar = styled('span')`
  color: ${DesignTokenColors.alert800};
  font-weight: bold;
`;

const TitleWrapper = styled('h1')`
  margin-bottom: 4px;
`;

export default withStyles(styles)(QuestionnaireAnswers);
