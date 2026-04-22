import { Button, FormControl, TextField } from '@mui/material';
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
import { makeRequestParamsDictionary } from '../react-query/makeRequestParams';
import { useAnswerListSaveMutation } from '../react-query/mutations';
import { METHOD, useFetchData } from '../react-query/WeConnectQuery';
import capturePersonListRetrieveData from '../models/capturePersonListRetrieveData';
import { useConnectAppContext, useConnectDispatch } from '../contexts/ConnectAppContext';
import {
  captureAnswerListRetrieveData,
  captureQuestionListRetrieveData,
  captureQuestionnaireListRetrieveData,
  getAnswerToQuestion, getAnswerValueToQuestion,
  getQuestionById,
  getQuestionsForQuestionnaire,
} from '../models/QuestionnaireModel';
import convertToInteger from '../common/utils/convertToInteger';
import { useGetFullNamePreferred } from '../models/PersonModel';


const AnswerQuestions = ({ classes, setShowHeaderFooter }) => {
  renderLog('AnswerQuestions');  // Set LOG_RENDER_EVENTS to log all renders
  const { apiDataCache } = useConnectAppContext();
  const { allAnswersCache, allPeopleCache, allQuestionnairesCache, allQuestionsCache } = apiDataCache;
  const dispatch = useConnectDispatch();
  const { mutate: answerListSave } = useAnswerListSaveMutation();
  const params  = useParams();

  const [answersSubmitted, setAnswersSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState(undefined);
  const [inputValues, setInputValues] = useState({});
  const [inputValuesInError, setInputValuesInError] = useState({});
  const [personId] = useState(parseInt(params.personId, 10));
  const [questionList, setQuestionList] = useState(undefined);
  const [questionnaire, setQuestionnaire] = useState(undefined);
  const [questionnaireId] = useState(parseInt(params.questionnaireId, 10));
  const [saveButtonActive, setSaveButtonActive] = useState(false);
  const personAnsweringName = useGetFullNamePreferred(personId);

  // In time, convert to only retrieve one person
  const personListRetrieveResults = useFetchData(['person-list-retrieve'], {}, METHOD.GET);
  useEffect(() => {
    if (personListRetrieveResults) {
      capturePersonListRetrieveData(personListRetrieveResults, apiDataCache, dispatch);
    }
  }, [personListRetrieveResults, allPeopleCache, dispatch, apiDataCache]);

  const questionnaireListRetrieveResults = useFetchData(['questionnaire-list-retrieve'], {}, METHOD.GET);
  useEffect(() => {
    if (questionnaireListRetrieveResults) {
      captureQuestionnaireListRetrieveData(questionnaireListRetrieveResults, apiDataCache, dispatch);
    }
  }, [questionnaireListRetrieveResults, allQuestionnairesCache, apiDataCache, dispatch]);

  const questionListRetrieveResults = useFetchData(['question-list-retrieve'], { questionnaireId: questionnaireId || '-1' }, METHOD.GET);
  useEffect(() => {
    if (questionListRetrieveResults) {
      captureQuestionListRetrieveData(questionListRetrieveResults, apiDataCache, dispatch);
    }
  }, [questionListRetrieveResults, allQuestionsCache]);

  // OLD: const requestParams = `personIdList[]=${personId}&questionnaireId=${questionnaireId}`;
  const requestParams = {
    personIdList: [personId],
    questionnaireId,
  };
  const answerListRetrieveResults = useFetchData(['questionnaire-responses-list-retrieve'], requestParams, METHOD.GET);
  useEffect(() => {
    if (answerListRetrieveResults) {
      captureAnswerListRetrieveData(answerListRetrieveResults, apiDataCache, dispatch);
    }
  }, [answerListRetrieveResults, apiDataCache, dispatch]);

  const sortQuestionsByOrder = (questions) => [...questions].sort((a, b) => a.questionOrder - b.questionOrder);

  useEffect(() => {
    if (allQuestionnairesCache) {
      if (questionnaireId && allQuestionnairesCache[questionnaireId]) {
        setQuestionnaire(allQuestionnairesCache[questionnaireId]);
      }
    }
  }, [allQuestionnairesCache, questionnaireId]);

  useEffect(() => {
    // console.log('Questionnaire useEffect getQuestionsForQuestionnaire(questionnaireId):', questionnaireId);
    const questionsForCurrentQuestionnaire = getQuestionsForQuestionnaire(questionnaireId, allQuestionsCache) || [];
    if (questionsForCurrentQuestionnaire && questionsForCurrentQuestionnaire.length > 0) {
      setQuestionList(sortQuestionsByOrder(questionsForCurrentQuestionnaire));
    }
  }, [allQuestionsCache, questionnaireId]);

  useEffect(() => {
    setShowHeaderFooter(false);
    return () => {
      setShowHeaderFooter(true);
    };
  }, []);

  const allRequiredFieldsHaveValue = (inputValuesRevised) => {
    let requiredValueMissing = false;
    questionList.forEach((question) => {
      if (question.requireAnswer === true) {
        let answerValue;
        if (`questionAnswer-${question.id}` in inputValuesRevised) {
          answerValue = inputValuesRevised[`questionAnswer-${question.id}`];
        } else {
          answerValue = getAnswerValueToQuestion(question.id, personId, allAnswersCache);
        }
        if (answerValue === undefined || answerValue === null || answerValue === '') {
          requiredValueMissing = true;
        }
      }
    });
    return !requiredValueMissing;
  };
  const isValidDateFormat = (date) => {
    if (!date) return true; // Empty dates are valid
    // Validate YYYY-MM-DD format
    const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
    if (!dateRegex.test(date)) {
      return false; // Invalid format
    }
    // Also validate that it's a real date (e.g., not 2025-02-30)
    const [year, month, day] = date.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    // Check if the date object has the same values (this catches invalid dates like Feb 30)
    return dateObj.getFullYear() === year &&
      dateObj.getMonth() === month - 1 &&
      dateObj.getDate() === day;
  };
  const updateQuestionAnswer = (questionId) => {
    // eslint-disable-next-line no-restricted-globals
    const newValue = event.target.value;
    const question = getQuestionById(questionId, allQuestionsCache);
    // console.log('question:', question);
    let inError = false;
    let inputValuesRevised = { ...inputValues };
    if (question && question.answerType) {
      if (question.answerType === 'BOOLEAN') {
        // console.log('Converting to boolean newValue:', newValue);
        setInputValues({ ...inputValues, [`questionAnswer-${questionId}`]: !!newValue });
      } else if (question.answerType === 'INTEGER') {
        const newValueAsInteger = convertToInteger(newValue);
        // console.log('Converting to integer newValue:', newValue, ', newValueAsInteger:', newValueAsInteger);
        inError = newValue !== newValueAsInteger.toString(); // Compare as strings
        setInputValuesInError({ ...inputValuesInError, [questionId]: inError });
        // Store only the integer version
        inputValuesRevised = { ...inputValuesRevised, [`questionAnswer-${questionId}`]: newValueAsInteger };
        setInputValues(inputValuesRevised);
      } else if (question.answerType === 'DATE') {
        // Only validate when the full date format is entered (YYYY-MM-DD = 10 characters)
        inError = !isValidDateFormat(newValue);
        if (newValue && newValue.length === 10) {
          if (inError) {
            console.error(`Invalid date format entered for question "${question.questionText}": "${newValue}". Expected format: YYYY-MM-DD`);
          }
        }
        setInputValuesInError({ ...inputValuesInError, [questionId]: inError });
        // Store the raw value
        inputValuesRevised = { ...inputValuesRevised, [`questionAnswer-${questionId}`]: newValue };
        setInputValues(inputValuesRevised);
      } else {
        inputValuesRevised = { ...inputValuesRevised, [`questionAnswer-${questionId}`]: newValue };
        setInputValues(inputValuesRevised);
      }
    } else {
      inputValuesRevised = { ...inputValuesRevised, [`questionAnswer-${questionId}`]: newValue };
      setInputValues(inputValuesRevised);
    }
    const requiredValuesExist = allRequiredFieldsHaveValue(inputValuesRevised);
    // console.log('updateQuestionAnswer inError: ', inError, ', requiredValuesExist:', requiredValuesExist);
    setSaveButtonActive(!inError && requiredValuesExist);
  };

  const saveAnswers = async () => {
    let foundError = false;
    Object.keys(inputValues).forEach((key) => {
      const questionId = parseInt(key.match(/\d+/g));
      // console.log('Save key:', key, 'value:', inputValues[key], 'questionId:', questionId);
      const question = getQuestionById(questionId, allQuestionsCache);
      if (question.answerType === 'BOOLEAN') {
        const boolAnswers = ['t', 'f', 'true', 'false', '1', '0'];
        if (boolAnswers.includes(inputValues[questionId])) {
          setErrorMessage(`"${question.questionText}" requires 'true' or 'false'.`);
          setSaveButtonActive(false);
          foundError = true;
        }
      } else if (question.answerType === 'INTEGER') {
        // eslint-disable-next-line no-restricted-globals
        if (isNaN(inputValues[questionId])) {
          setErrorMessage(`"${question.questionText}" requires a single number.`);
          setSaveButtonActive(false);
          foundError = true;
        }
      } else if (question.answerType === 'DATE') {
        const dateValue = inputValues[key];
        // Only validate if a date value exists
        if (dateValue && dateValue !== '') {
          if (!isValidDateFormat(dateValue)) {
            console.error(`Invalid date format for question "${question.questionText}": "${dateValue}". Expected format: YYYY-MM-DD`);
            setErrorMessage(`"${question.questionText}" requires a date in the format of YYYY-MM-DD (e.g., 2025-01-01).`);
            setSaveButtonActive(false);
            foundError = true;
          }
        }

      }
    });
    if (!foundError) {
      setErrorMessage(undefined);
    }

    const saveParams = makeRequestParamsDictionary({
      questionnaireId,
      personId,
      ...inputValues,
    }, {});

    try {
      await answerListSave(saveParams);
      // Assuming answers have been saved successfully (TODO: get confirmation from the server)
      // If Questionnaire being answered isOfferQuestionnaire, then update the
      //  person answering these questions with statusOfferQuestionnaireAnswered == true
      setSaveButtonActive(false);
      setAnswersSubmitted(true);
    } catch (error) {
      // Handle any errors here
      console.error('Error saving answers:', error);
      setErrorMessage('There was an error saving your answers. Please try again.');
    }
  };

  const isQuestionIdInError = (questionId) => inputValuesInError[questionId] === true;
  const helperTextIfQuestionIdInError = (questionId) => {
    const question = getQuestionById(questionId, allQuestionsCache);
    if (!question || !question.answerType) {
      return '';
    }
    // console.log(`helperTextIfQuestionIdInError for questionId: ${questionId}, answer:`, answer);
    let helperText = '';
    switch (question.answerType) {
      case 'BOOLEAN':
        helperText = 'Please enter "true" or "false"';
        break;
      case 'INTEGER':
        helperText = 'Please enter one number.';
        break;
      case 'DATE':
        helperText = 'Please enter the date in the format YYYY-MM-DD (e.g., 2025-01-01)';
        break;
      case 'STRING':
        helperText = 'Please enter a valid value.';
        break;
      default:
        helperText = '';
        break;
    }
    // console.log('helperTextIfQuestionIdInError helperText:', helperText);
    return helperText;
  };

  if (questionnaire && !questionnaire.isCreatePersonQuestionnaire && !personId) {
    return (
      <div>
        <Helmet>
          <title>
            Questionnaire For You -
            {' '}
            {webAppConfig.NAME_FOR_BROWSER_TAB_TITLE}
          </title>
          <meta name="robots" content="noindex" data-react-helmet="true" />
        </Helmet>
        <PageContentContainer>
          <TitleWrapper>
            Missing person ID. Please notify the person who sent you this questionnaire.
          </TitleWrapper>
          <BottomMargin />
        </PageContentContainer>
      </div>
    );
  }

  return (
    <div>
      <Helmet>
        <title>
          Questionnaire For You -
          {' '}
          {webAppConfig.NAME_FOR_BROWSER_TAB_TITLE}
        </title>
        <meta name="robots" content="noindex" data-react-helmet="true" />
      </Helmet>
      <PageContentContainer>
        {answersSubmitted && (
          <SuccessMessage>
            Your answers have been submitted successfully. Thank you for your participation.
          </SuccessMessage>
        )}
        <QuestionsHeaderWrapper>
          {((questionnaire && questionnaire.questionnaireTitle) || personAnsweringName) && (
            <TitleWrapper>
              {personAnsweringName && (
                <span>
                  Welcome
                  {' '}
                  {personAnsweringName}!
                  {' '}
                </span>
              )}
              {(questionnaire && questionnaire.questionnaireTitle) && (
                <span>
                  {questionnaire.questionnaireTitle}
                </span>
              )}
            </TitleWrapper>
          )}
          {(questionnaire && questionnaire.questionnaireInstructions) && (
            <InstructionsWrapper>
              {questionnaire.questionnaireInstructions}
            </InstructionsWrapper>
          )}
        </QuestionsHeaderWrapper>
        {answersSubmitted ? (
          <AnswerText>
            {/* NOTE: 2025-04-06 We are turning off the entire form after submitting */}
            {/* because there is a bug in useAnswerListSaveMutation that is preventing a fresh re-fetch of data from questionnaire-responses-list-retrieve. */}
            {/* When that is fixed I'd prefer to show the "YOU ANSWERED" code below */}
            Thank you for submitting your answers!
          </AnswerText>
        ) : (
          <FormControl classes={{ root: classes.formControl }}>
            {questionList && questionList.map((question) => (
              <OneQuestionWrapper key={`questionnaire-${question.id}`}>
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
                {answersSubmitted ? (
                  <AnswerText>
                    YOU ANSWERED:
                    {' '}
                    {getAnswerValueToQuestion(question.id, personId, allAnswersCache)}
                  </AnswerText>
                ) : (
                  <QuestionFormWrapper>
                    <TextField
                      classes={(question.answerType === 'INTEGER') ? {} : { root: classes.formControl }}
                      defaultValue={getAnswerValueToQuestion(question.id, personId, allAnswersCache)}
                      error={isQuestionIdInError(question.id)}
                      helperText={isQuestionIdInError(question.id) ? helperTextIfQuestionIdInError(question.id) : ''}
                      id={`questionAnswer-${question.id}`}
                      InputProps={{
                        style: { height: 'auto' },
                      }}
                      margin="dense"
                      minRows={1}
                      maxRows={4}
                      multiline
                      name={`questionAnswer-${question.id}`}
                      onChange={() => updateQuestionAnswer(question.id)}
                      placeholder={question.questionPlaceholder || ''}
                      variant="outlined"
                    />
                  </QuestionFormWrapper>
                )}
              </OneQuestionWrapper>
            ))}
            {!answersSubmitted && (
              <ErrorLine>{errorMessage}</ErrorLine>
            )}
            <SaveButtonWrapper>
              <Button
                classes={{ root: classes.saveAnswersButton }}
                color="primary"
                disabled={!saveButtonActive}
                variant="contained"
                onClick={saveAnswers}
              >
                Save Your Answers
              </Button>
            </SaveButtonWrapper>
          </FormControl>
        )}
        <BottomMargin />
      </PageContentContainer>
    </div>
  );
};
AnswerQuestions.propTypes = {
  classes: PropTypes.object.isRequired,
  setShowHeaderFooter: PropTypes.func.isRequired,
};

const styles = (theme) => ({
  ballotButtonIconRoot: {
    marginRight: 8,
  },
  formControl: {
    width: '100%',
  },
  saveAnswersButton: {
    maxWidth: '90%',
    width: 300,
    [theme.breakpoints.down('sm')]: {
      width: '90%',
    },
  },
});

const AnswerText = styled('div')`
  font-weight: 500;
  color: green;
`;

const BottomMargin = styled('div')`
  margin-bottom: 80px;
`;

const ErrorLine = styled('div')`
  margin-top: 24px;
  font-weight: 500;
  color: red;
`;

const InstructionsWrapper = styled('div')`
  color: ${DesignTokenColors.neutralUI300};
  font-size: 1.2em;
`;

const OneQuestionWrapper = styled('div')`
  // border-bottom: 1px solid ${DesignTokenColors.neutralUI200};
  margin-bottom: 24px;
`;

const QuestionInstructions = styled('div')`
  color: ${DesignTokenColors.neutralUI300};
`;

const QuestionFormWrapper = styled('div')`
  width: 100%;
`;

const QuestionText = styled('div')`
`;

const QuestionsHeaderWrapper = styled('div')`
  margin-bottom: 24px;
`;

const RequiredStar = styled('span')`
  color: ${DesignTokenColors.alert800};
  font-weight: bold;
`;

const SaveButtonWrapper = styled('div')`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  background-color: white;
  padding: 15px 0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;

const SuccessMessage = styled('div')`
  margin-top: 24px;
  font-weight: 500;
  color: green;
`;

const TitleWrapper = styled('h1')`
  margin-bottom: 8px;
`;

export default withStyles(styles)(AnswerQuestions);
