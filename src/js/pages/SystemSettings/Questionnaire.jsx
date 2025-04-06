import { Button } from '@mui/material';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { DndContext, useSensors, useSensor, PointerSensor, TouchSensor, closestCenter, KeyboardSensor } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router';
import styled from 'styled-components';
import DesignTokenColors from '../../common/components/Style/DesignTokenColors';
import { renderLog } from '../../common/utils/logging';
import { EditStyled } from '../../components/Style/iconStyles';
import { ButtonWithLinkStyle } from '../../components/Style/linkStyles';
import { PageContentContainer } from '../../components/Style/pageLayoutStyles';
import webAppConfig from '../../config';
import { useConnectAppContext, useConnectDispatch } from '../../contexts/ConnectAppContext';
import { METHOD, useFetchData } from '../../react-query/WeConnectQuery';
import { captureQuestionListRetrieveData, captureQuestionnaireListRetrieveData, getQuestionsForQuestionnaire } from '../../models/QuestionnaireModel';
import { useQuestionListSaveMutation } from '../../react-query/mutations';
import makeRequestParams from '../../react-query/makeRequestParams';


const Questionnaire = ({ classes }) => {
  renderLog('Questionnaire');
  const { setAppContextValue, getAppContextValue } = useConnectAppContext();
  const { apiDataCache } = useConnectAppContext();
  const { allQuestionsCache, allQuestionnairesCache } = apiDataCache;
  const dispatch = useConnectDispatch();
  const { mutate: questionListSave } = useQuestionListSaveMutation();

  const [questionList, setQuestionList] = useState([]);
  const [questionnaire, setQuestionnaire] = useState(getAppContextValue('selectedQuestionnaire'));
  const [activeId, setActiveId] = useState(null);

  const targetQuestionnaireId = parseInt(useParams().questionnaireId, 10);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 0,
        tolerance: 10,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const sortQuestionsByOrder = (questions) => {
    return [...questions].sort((a, b) => a.questionOrder - b.questionOrder);
  };

  const questionnaireListRetrieveResults = useFetchData(['questionnaire-list-retrieve'], {}, METHOD.GET);
  useEffect(() => {
    // console.log('questionnaireListRetrieveResults in Questionnaire useEffect captureQuestionnaireListRetrieveData');
    if (questionnaireListRetrieveResults) {
      captureQuestionnaireListRetrieveData(questionnaireListRetrieveResults, apiDataCache, dispatch);
    }
  }, [questionnaireListRetrieveResults, allQuestionnairesCache]);

  const questionListRetrieveResults = useFetchData(['question-list-retrieve'], { questionnaireId: targetQuestionnaireId || '-1' }, METHOD.GET);
  useEffect(() => {
    // console.log('questionListRetrieveResults in Questionnaire useEffect captureQuestionListRetrieveData');
    if (questionListRetrieveResults) {
      captureQuestionListRetrieveData(questionListRetrieveResults, apiDataCache, dispatch);
    }
  }, [questionListRetrieveResults, allQuestionsCache]);

  useEffect(() => {
    // console.log('Questionnaire useEffect setQuestionnaire targetQuestionnaireId:', targetQuestionnaireId);
    if (allQuestionnairesCache) {
      if (targetQuestionnaireId && allQuestionnairesCache[targetQuestionnaireId]) {
        setQuestionnaire(allQuestionnairesCache[targetQuestionnaireId]);
      }
    }
  }, [allQuestionnairesCache]);

  useEffect(() => {
    // console.log('Questionnaire useEffect getQuestionsForQuestionnaire(targetQuestionnaireId):', targetQuestionnaireId);
    const questionsForCurrentQuestionnaire = getQuestionsForQuestionnaire(targetQuestionnaireId, allQuestionsCache) || [];
    if (questionsForCurrentQuestionnaire && questionsForCurrentQuestionnaire.length > 0) {
      setQuestionList(sortQuestionsByOrder(questionsForCurrentQuestionnaire));
    }
  }, [allQuestionsCache, targetQuestionnaireId]);

  const addQuestionClick = () => {
    setAppContextValue('editQuestionDrawerOpen', true);
    setAppContextValue('selectedQuestion', undefined);
    setAppContextValue('selectedQuestionnaire', questionnaire);
    setAppContextValue('editQuestionDrawerLabel', 'Add Question');
  };

  const editQuestionClick = (question) => {
    setAppContextValue('editQuestionDrawerOpen', true);
    setAppContextValue('selectedQuestion', question);
    setAppContextValue('selectedQuestionnaire', questionnaire);
    setAppContextValue('editQuestionDrawerLabel', 'Edit Question');
  };

  const editQuestionnaireClick = () => {
    setAppContextValue('editQuestionnaireDrawerOpen', true);
    setAppContextValue('selectedQuestionnaire', questionnaire);
    setAppContextValue('editQuestionnaireDrawerLabel', 'Edit Questionnaire');
  };

  const onQuestionDragEnd = (event) => {
    const { active, over } = event;
    // console.log('onQuestionDragEnd, active:', active, ', over:', over);
    if (active.id !== over.id) {
      // Within each question in the questionList, we want to update the questionOrder value
      const adjustQuestionList = (questions) => {
        const oldQuestionIndex = questions.findIndex((question) => question.id === active.id);
        const newQuestionIndex = questions.findIndex((question) => question.id === over.id);
        // console.log('oldQuestionIndex:', oldQuestionIndex, ', newQuestionIndex:', newQuestionIndex);

        const movedQuestions = arrayMove(questions, oldQuestionIndex, newQuestionIndex);
        // Update questionOrder based on new array indices
        return movedQuestions.map((question, index) => ({
          ...question,
          questionOrder: index,
        }));
      };
      const updatedQuestionList = adjustQuestionList(questionList);
      // mutation for prisma, array with question id and order
      // console.log('mutation for prisma, array with question id and order, updatedQuestionList:', updatedQuestionList);
      let inputValues = {};

      for (let i = 0; i < updatedQuestionList.length; i++) {
        const question = updatedQuestionList[i];
        inputValues = { ...inputValues, [`questionOrder-${question.id}`]: question.questionOrder };
      }
      const requestParams = makeRequestParams({
        questionnaireId: questionnaire.id,
        ...inputValues,
      }, {});

      questionListSave(requestParams);
      setQuestionList(sortQuestionsByOrder(updatedQuestionList));
    }
    setActiveId(null);
  };

  const onQuestionDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const ReturnQuestionJSX = ({ question }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
    } = useSortable({ id: question.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <OneQuestionnaireWrapper
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        key={`questionnaire-${question.id}`}
        id={question.id}
        activeId={activeId}
      >
        {question.questionOrder + 1}
        .
        {' '}
        {question.questionText}
        {' '}
        {question.requireAnswer && (
          <RequiredStar> *</RequiredStar>
        )}
        <ButtonWithLinkStyle onClick={() => editQuestionClick(question)}>
          <EditStyled />
        </ButtonWithLinkStyle>
      </OneQuestionnaireWrapper>
    );
  };

  return (
    <>
      <Helmet>
        <title>
          Questionnaire Details -
          {' '}
          {webAppConfig.NAME_FOR_BROWSER_TAB_TITLE}
        </title>
        {/* <link rel="canonical" href={`${webAppConfig.WECONNECT_URL_FOR_SEO}/questionnaire-question-list/${questionnaireIdTemp}`} /> */}
      </Helmet>
      <PageContentContainer>
        <QuestionnaireBreadcrumbWrapper>
          <Link to="/system-settings" style={{ height: '40px', fontSize: 'large' }} className="u-cursor--pointer u-link-color">
            Questionnaires
          </Link>
          {questionnaire && questionnaire.questionnaireId && (
            <>
              {' '}
              &gt;
              {' '}
              <QuestionnaireNameBreadcrumb>{questionnaire.questionnaireName}</QuestionnaireNameBreadcrumb>
              <ButtonWithLinkStyle onClick={editQuestionnaireClick}>
                <EditStyled />
              </ButtonWithLinkStyle>
            </>
          )}
        </QuestionnaireBreadcrumbWrapper>
        {questionnaire && questionnaire.questionnaireTitle && (
          <TitleWrapper>
            {questionnaire.questionnaireTitle}
          </TitleWrapper>
        )}
        {questionnaire && questionnaire.questionnaireInstructions && (
          <InstructionsWrapper>
            {questionnaire.questionnaireInstructions}
          </InstructionsWrapper>
        )}
        {(questionList && questionList.length > 0) ? (
          <DndContext
            sensors={sensors}
            modifiers={[restrictToParentElement]}
            collisionDetection={closestCenter}
            onDragEnd={onQuestionDragEnd}
            onDragStart={onQuestionDragStart} // used for applying border on drag
          >
            <QuestionListWrapper>
              <SortableContext
                items={questionList}
                strategy={verticalListSortingStrategy}
              >
                {questionList.map((question) => (
                  <ReturnQuestionJSX
                    key={question.id}
                    question={question}
                  />
                ))}
              </SortableContext>
            </QuestionListWrapper>
          </DndContext>
        ) : (
          <QuestionListWrapper>
            No questions found for this questionnaire.
          </QuestionListWrapper>
        )}
        <AddButtonWrapper>
          <Button
            classes={{ root: classes.addQuestionnaireButtonRoot }}
            color="primary"
            variant="outlined"
            onClick={addQuestionClick}
          >
            Add Question
          </Button>
        </AddButtonWrapper>
      </PageContentContainer>
    </>
  );
};
Questionnaire.propTypes = {
  classes: PropTypes.object.isRequired,
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

const InstructionsWrapper = styled('div')`
  color: ${DesignTokenColors.neutralUI300};
  font-size: 1.2em;
`;

const QuestionnaireBreadcrumbWrapper = styled('div')`
  height: 100px;
  align-content: center;
`;

const OneQuestionnaireWrapper = styled('div')`
  margin-bottom: 20px;
  cursor: move;
  touch-action: none; //needed for draggability in mobile
  border: ${(props) => (props.id === props.activeId ? `1px solid ${DesignTokenColors.neutral500}` : 'none')};
  // background-color: ${(props) => (props.id === props.activeId ? `${DesignTokenColors.neutral50}` : 'none')};
  border-radius: 4px;
`;

const QuestionListWrapper = styled('div')`
  margin-top: 24px;
  padding-bottom: 24px;
`;

const QuestionnaireNameBreadcrumb = styled('span')`
  padding: 0 20px 0 10px;
`;

const RequiredStar = styled('span')`
  color: ${DesignTokenColors.alert800};
  font-weight: bold;
`;

const TitleWrapper = styled('h1')`
  line-height: 1.1;
  margin-bottom: 8px;
`;

export default withStyles(styles)(Questionnaire);
