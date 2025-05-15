import { ContentCopy } from '@mui/icons-material';
import { Button, Checkbox, FormControl, FormControlLabel, InputLabel, Select, TextField } from '@mui/material'; // FormLabel, Radio, RadioGroup,
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import styled from 'styled-components';
import DesignTokenColors from '../../common/components/Style/DesignTokenColors';
import { renderLog } from '../../common/utils/logging';
import { useConnectAppContext } from '../../contexts/ConnectAppContext';
import makeRequestParams from '../../react-query/makeRequestParams';
import { useQuestionSaveMutation } from '../../react-query/mutations';
import { SpanWithLinkStyle } from '../Style/linkStyles';

const PERSON_FIELDS_ACCEPTED_FROM_QUESTIONNAIRE = [
  'birthdayMonthAndDay',
  'dateEndDate',
  'dateStartDate',
  'emailOfficial',
  'emailPersonal',
  'firstName',
  'firstNamePreferred',
  'hoursPerWeekEstimate',
  'jobTitle',
  'lastName',
  'linkedInUrl',
  'location',
  'stateCode',
  'zipCode',
];

// const QUESTION_FIELDS_IN_FORM = [
//   'answerType', 'fieldMappingRule',
//   'questionInstructions', 'questionText',
//   'requireAnswer', 'statusActive'];

const EditQuestionForm = ({ classes }) => {
  renderLog('EditQuestionForm');
  const { getAppContextValue, setAppContextValue } = useConnectAppContext();
  const { mutate: mutateQuestionSave } = useQuestionSaveMutation();

  const [answerType, setAnswerType] = useState('STRING');
  const [question] = useState(getAppContextValue('selectedQuestion'));
  const [questionnaire] = useState(getAppContextValue('selectedQuestionnaire'));
  const [fieldMappingRule, setFieldMappingRule] = useState('');
  const [questionPlaceholder, setQuestionPlaceholder] = useState('');
  const [questionInstructions, setQuestionInstructions] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [requireAnswer, setRequireAnswer] = useState(false);
  const [statusActive, setStatusActive]  = useState(true);

  const [fieldMappingRuleCopied, setFieldMappingRuleCopied] = useState('');
  const [saveButtonActive, setSaveButtonActive] = useState(false);
  const [showFieldMappingOptions, setShowFieldMappingOptions] = useState(false);

  const fieldMappingRuleInputRef = useRef('');
  const questionPlaceholderInputRef = useRef('');
  const questionInstructionsInputRef = useRef('');
  const questionTextInputRef = useRef('');
  const requireAnswerInputRef = useRef(false);
  const statusActiveInputRef = useRef(true);

  useEffect(() => {
    if (question) {
      setFieldMappingRule(question.fieldMappingRule);
      setQuestionPlaceholder(question.questionPlaceholder);
      setQuestionInstructions(question.questionInstructions);
      setQuestionText(question.questionText);
      setAnswerType(question.answerType);
      setRequireAnswer(question.requireAnswer);
      setStatusActive(question.statusActive);
    } else {
      setFieldMappingRule('');
      setQuestionPlaceholder('');
      setQuestionInstructions('');
      setQuestionText('');
      setAnswerType('STRING');
      setRequireAnswer(false);
      setStatusActive(true);
    }
  }, [question]);

  // eslint-disable-next-line no-unused-vars
  const copyFieldMappingRule = (fieldMappingRuleIncoming) => {
    // openSnackbar({ message: 'Copied!' });
    setFieldMappingRuleCopied(fieldMappingRuleIncoming);
    setFieldMappingRule(fieldMappingRuleIncoming);
    if (fieldMappingRuleInputRef.current) {
      fieldMappingRuleInputRef.current.value = fieldMappingRuleIncoming;
      fieldMappingRuleInputRef.current.focus();
      // console.log('fieldMappingRuleInputRef.current.value:', fieldMappingRuleInputRef.current.value);
    }
    setSaveButtonActive(true);
    setTimeout(() => {
      setFieldMappingRuleCopied('');
    }, 1500);
  };

  const saveQuestion = () => {
    const plainParams = {
      questionId: question ? question.id : '-1',
      questionnaireId: questionnaire ? questionnaire.id : 'Need to navigate from earlier page where q is put in AppContext',   // hack
    };
    const params = {
      answerType,
      fieldMappingRule: fieldMappingRuleInputRef.current.value,
      // questionOrder
      questionPlaceholder: questionPlaceholderInputRef.current.value,
      questionInstructions: questionInstructionsInputRef.current.value,
      questionText: questionTextInputRef.current.value,
      requireAnswer: (requireAnswerInputRef.current.checked),
      statusActive: (statusActiveInputRef.current.checked),
    };
    const requestParams = makeRequestParams(plainParams, params);
    mutateQuestionSave(requestParams);
    // console.log('saveQuestionnaire requestParams:', requestParams);
    setSaveButtonActive(false);
    setAppContextValue('editQuestionDrawerOpen', false);
    setAppContextValue('selectedQuestion', undefined);
    setAppContextValue('selectedQuestionnaire', undefined);
    setAppContextValue('editQuestionDrawerLabel', '');
  };

  const updateSaveButton = () => {
    if (questionTextInputRef.current.value && questionTextInputRef.current.value.length) {
      if (!saveButtonActive) {
        setSaveButtonActive(true);
      }
    }
  };

  const handleRadioChange = (event) => {
    setAnswerType(event.target.value);
    if (!saveButtonActive) {
      setSaveButtonActive(true);
    }
  };

  return (
    <EditQuestionFormWrapper>
      <FormControl classes={{ root: classes.formControl }}>
        <CheckboxLabel
          classes={{ label: classes.checkboxLabel }}
          control={(
            <Checkbox
              checked={Boolean(statusActive)}
              className={classes.checkboxRoot}
              color="primary"
              id="statusActiveToBeSaved"
              inputRef={statusActiveInputRef}
              name="statusActive"
              onChange={(e) => {
                setStatusActive(e.target.checked);
                updateSaveButton();
              }}
            />
          )}
          label="Question is active"
        />
        <TextField
          autoFocus
          defaultValue={questionText}
          id="questionTextToBeSaved"
          inputRef={questionTextInputRef}
          label="Question"
          margin="dense"
          multiline
          name="questionText"
          onChange={() => updateSaveButton()}
          placeholder="Question you are asking"
          rows={6}
          variant="outlined"
        />
        <TextField
          defaultValue={questionInstructions}
          id="questionInstructionsToBeSaved"
          inputRef={questionInstructionsInputRef}
          label="Special Instructions"
          margin="dense"
          multiline
          name="questionInstructions"
          onChange={() => updateSaveButton()}
          placeholder="Instructions to clarify the question"
          rows={4}
          variant="outlined"
        />
        <TextField
          defaultValue={questionPlaceholder}
          id="questionPlaceholderToBeSaved"
          inputRef={questionPlaceholderInputRef}
          label="Placeholder text when input empty"
          margin="dense"
          name="questionPlaceholder"
          onChange={() => updateSaveButton()}
          placeholder="Text in the question input"
          variant="outlined"
        />
        <FormControl
          variant="outlined"
          className={`${classes.formControl} ${classes.answerTypeDropdown}`}
        >
          <InputLabel htmlFor="answer-type-dropdown">Answer Type</InputLabel>
          <Select
            native
            variant="outlined"
            value={answerType}
            onChange={handleRadioChange}
            label="Answer Type"
            inputProps={{
              name: 'answerType',
              id: 'answer-type-dropdown',
            }}
          >
            <option value="">-- Choose answer type --</option>
            <option value="BOOLEAN">BOOLEAN</option>
            <option value="DATE">DATE</option>
            <option value="INTEGER">INTEGER</option>
            <option value="STRING">STRING</option>
          </Select>
        </FormControl>
        <CheckboxLabel
          classes={{ label: classes.checkboxLabel }}
          control={(
            <Checkbox
              checked={Boolean(requireAnswer)}
              className={classes.checkboxRoot}
              color="primary"
              id="requireAnswerToBeSaved"
              inputRef={requireAnswerInputRef}
              name="requireAnswer"
              onChange={(e) => {
                setRequireAnswer(e.target.checked);
                updateSaveButton();
              }}
            />
          )}
          label="Require an answer to this question"
        />
        {fieldMappingRule && (
          <MapAnswerTitle>
            Map answer to:
            {' '}
            {fieldMappingRule}
          </MapAnswerTitle>
        )}
        <ShowMappingOptions>
          <div>
            {showFieldMappingOptions ? (
              <SpanWithLinkStyle onClick={() => setShowFieldMappingOptions(false)}>hide field mapping options</SpanWithLinkStyle>
            ) : (
              <SpanWithLinkStyle onClick={() => setShowFieldMappingOptions(true)}>show field mapping options</SpanWithLinkStyle>
            )}
          </div>
        </ShowMappingOptions>
        <TextField
          classes={showFieldMappingOptions ? {} : { root: classes.hideThisField }}
          defaultValue={fieldMappingRule}
          id="fieldMappingRuleToBeSaved"
          inputRef={fieldMappingRuleInputRef}
          label="Save answer to this database field"
          name="fieldMappingRule"
          margin="dense"
          onChange={() => updateSaveButton()}
          placeholder="ex/ Person.firstName"
          variant="outlined"
        />
        {showFieldMappingOptions && (
          <FieldMappingOptions>
            {PERSON_FIELDS_ACCEPTED_FROM_QUESTIONNAIRE.map((fieldName) => (
              <OneFieldMappingOptionWrapper key={`option-${fieldName}`}>
                <CopyToClipboard text={`Person.${fieldName}`} onCopy={() => copyFieldMappingRule(`Person.${fieldName}`)}>
                  <OneFieldMappingOption>
                    Person.
                    {fieldName}
                    <ContentCopyStyled />
                  </OneFieldMappingOption>
                </CopyToClipboard>
                {fieldMappingRuleCopied === `Person.${fieldName}` && <>&nbsp;Copied!</>}
              </OneFieldMappingOptionWrapper>
            ))}
          </FieldMappingOptions>
        )}
        <Button
          classes={{ root: classes.saveQuestionButton }}
          color="primary"
          disabled={!saveButtonActive}
          onClick={saveQuestion}
          variant="contained"
        >
          Save Question
        </Button>
      </FormControl>
    </EditQuestionFormWrapper>
  );
};
EditQuestionForm.propTypes = {
  classes: PropTypes.object.isRequired,
};

const styles = (theme) => ({
  answerTypeDropdown: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  checkboxRoot: {
    paddingTop: 0,
    paddingLeft: '9px',
    paddingBottom: 0,
  },
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
  saveQuestionButton: {
    marginTop: 12,
    width: 300,
    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
  },
});


const CheckboxLabel = styled(FormControlLabel)`
  margin-bottom: 0 !important;
`;

const ContentCopyStyled = styled(ContentCopy)`
  color: ${DesignTokenColors.neutral300};
  height: 16px;
  margin-left: 4px;
  width: 16px;
`;

const EditQuestionFormWrapper = styled('div')`
`;

const FieldMappingOptions = styled('div')`
  margin-bottom: 16px;
`;

const MapAnswerTitle = styled('div')`
  margin-top: 12px;
`;

const OneFieldMappingOption = styled('div')`
  align-items: center;
  color: ${DesignTokenColors.neutral300};
  cursor: pointer;
  display: flex;
`;

const OneFieldMappingOptionWrapper = styled('div')`
  align-items: center;
  display: flex;
`;

const ShowMappingOptions = styled('div')`
  margin-bottom: 10px;
  margin-top: 5px;
`;

export default withStyles(styles)(EditQuestionForm);
