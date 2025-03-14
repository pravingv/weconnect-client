import { ContentCopy } from '@mui/icons-material';
import { Button, Checkbox, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField } from '@mui/material'; // FormLabel, Radio, RadioGroup,
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

const PERSON_FIELDS_ACCEPTED = [
  'firstName',
  'firstNamePreferred',
  'emailPersonal',
  'hoursPerWeekEstimate',
  'jobTitle',
  'lastName',
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

  const [question] = useState(getAppContextValue('selectedQuestion'));
  const [questionnaire] = useState(getAppContextValue('selectedQuestionnaire'));
  const [fieldMappingRuleValue, setFieldMappingRuleValue] = useState('');
  const [placeholderValue, setPlaceholderValue] = useState('');
  const [questionInstructionsValue, setQuestionInstructionsValue] = useState('');
  const [questionTextValue, setQuestionTextValue] = useState('');
  const [requireAnswerValue, setRequireAnswerValue] = useState(false);
  const [statusActiveValue, setStatusActiveValue]  = useState(true);

  const [fieldMappingRuleCopied, setFieldMappingRuleCopied] = useState('');
  const [saveButtonActive, setSaveButtonActive] = useState(false);
  const [showFieldMappingOptions, setShowFieldMappingOptions] = useState(false);
  const [radioValue, setRadioValue] = useState('STRING');

  const fieldMappingRuleInputRef = useRef('');
  const formatRadioInputRef = useRef(true);
  const placeholderInputRef = useRef('');
  const questionInstructionsInputRef = useRef('');
  const questionTextInputRef = useRef('');
  const requireAnswerInputRef = useRef(false);
  const statusActiveInputRef = useRef(true);

  useEffect(() => {
    if (question) {
      setFieldMappingRuleValue(question.fieldMappingRule);
      setPlaceholderValue(question.questionPlaceholder);
      setQuestionInstructionsValue(question.questionInstructions);
      setQuestionTextValue(question.questionText);
      setRadioValue(question.answerType);
      setRequireAnswerValue(question.requireAnswer);
      setStatusActiveValue(question.statusActive);
    } else {
      setFieldMappingRuleValue('');
      setPlaceholderValue('');
      setQuestionInstructionsValue('');
      setQuestionTextValue('');
      setRadioValue('STRING');
      setRequireAnswerValue(false);
      setStatusActiveValue(true);
    }
  }, [question]);

  // eslint-disable-next-line no-unused-vars
  const copyFieldMappingRule = (fieldMappingRule) => {
    // openSnackbar({ message: 'Copied!' });
    setFieldMappingRuleCopied(fieldMappingRule);
    setFieldMappingRuleValue(fieldMappingRule);
    if (fieldMappingRuleInputRef.current) {
      fieldMappingRuleInputRef.current.value = fieldMappingRule;
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
      answerType: radioValue,
      fieldMappingRule: fieldMappingRuleInputRef.current.value,
      questionPlaceholder: placeholderInputRef.current.value,
      questionInstructions: questionInstructionsInputRef.current.value,
      questionText: questionTextInputRef.current.value,
      requireAnswer: (requireAnswerInputRef.current.value === 'on'),
      statusActive: (statusActiveInputRef.current.value === 'on'),
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
    setRadioValue(event.target.value);
    if (!saveButtonActive) {
      setSaveButtonActive(true);
    }
  };

  return (
    <EditQuestionFormWrapper>
      <FormControl classes={{ root: classes.formControl }}>
        <TextField
          autoFocus
          defaultValue={questionTextValue}
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
          defaultValue={questionInstructionsValue}
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
          defaultValue={placeholderValue}
          id="questionPlaceholderToBeSaved"
          inputRef={placeholderInputRef}
          label="Placeholder text when input empty"
          margin="dense"
          name="questionPlaceholder"
          onChange={() => updateSaveButton()}
          placeholder="Text in the question input"
          variant="outlined"
        />
        <FormControl>
          <FormLabel id="demo-radio-buttons-group-label">Answer Type</FormLabel>
          <RadioGroup
            aria-labelledby="demo-radio-buttons-group-label"
            inputRef={formatRadioInputRef}
            value={radioValue}
            name="radio-buttons-group"
            onChange={handleRadioChange}
            row
            sx={{ paddingBottom: '20px' }}
          >
            <FormControlLabel value="STRING" control={<Radio />} label="String" />
            <FormControlLabel value="BOOLEAN" control={<Radio />} label="Boolean" />
            <FormControlLabel value="INTEGER" control={<Radio />} label="Integer" />
          </RadioGroup>
        </FormControl>
        <CheckboxLabel
          classes={{ label: classes.checkboxLabel }}
          control={(
            <Checkbox
              checked={Boolean(requireAnswerValue)}
              className={classes.checkboxRoot}
              color="primary"
              id="requireAnswerToBeSaved"
              inputRef={requireAnswerInputRef}
              name="requireAnswer"
              onChange={() => updateSaveButton()}
            />
          )}
          label="Require an answer to this question"
        />
        <CheckboxLabel
          classes={{ label: classes.checkboxLabel }}
          control={(
            <Checkbox
              checked={Boolean(statusActiveValue)}
              className={classes.checkboxRoot}
              color="primary"
              id="statusActiveToBeSaved"
              inputRef={statusActiveInputRef}
              name="statusActive"
              onChange={() => updateSaveButton()}
            />
          )}
          label="Question is active"
        />
        <ShowMappingOptions>
          <div>
            {showFieldMappingOptions ? (
              <SpanWithLinkStyle onClick={() => setShowFieldMappingOptions(false)}>hide field mapping options</SpanWithLinkStyle>
            ) : (
              <SpanWithLinkStyle onClick={() => setShowFieldMappingOptions(true)}>show field mapping options</SpanWithLinkStyle>
            )}
          </div>
        </ShowMappingOptions>
        {showFieldMappingOptions && (
          <TextField
            defaultValue={fieldMappingRuleValue}
            id="fieldMappingRuleToBeSaved"
            inputRef={fieldMappingRuleInputRef}
            label="Save answer to this database field"
            name="fieldMappingRule"
            margin="dense"
            onChange={() => updateSaveButton()}
            placeholder="ex/ Person.firstName"
            variant="outlined"
          />
        )}
        {showFieldMappingOptions && (
          <FieldMappingOptions>
            {PERSON_FIELDS_ACCEPTED.map((fieldName) => (
              <OneFieldMappingOption key={`option-${fieldName}`}>
                <CopyToClipboard text={`Person.${fieldName}`} onCopy={() => copyFieldMappingRule(`Person.${fieldName}`)}>
                  <OneFieldMappingOption>
                    Person.
                    {fieldName}
                    <ContentCopyStyled />
                  </OneFieldMappingOption>
                </CopyToClipboard>
                {fieldMappingRuleCopied === `Person.${fieldName}` && <>&nbsp;Copied!</>}
              </OneFieldMappingOption>
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
  saveQuestionButton: {
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

const OneFieldMappingOption = styled('div')`
  align-items: center;
  color: ${DesignTokenColors.neutral300};
  display: flex;
`;

const ShowMappingOptions = styled('div')`
  margin-bottom: 10px;
  margin-top: 5px;
`;

export default withStyles(styles)(EditQuestionForm);
