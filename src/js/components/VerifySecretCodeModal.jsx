import { Button, Dialog, Modal, OutlinedInput } from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import withTheme from '@mui/styles/withTheme';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { isIPhone4in } from '../common/utils/cordovaUtils';
import { isCordova, isWebApp } from '../common/utils/isCordovaOrWebApp';
import { renderLog } from '../common/utils/logging';
import { useConnectAppContext } from '../contexts/ConnectAppContext';
import weConnectQueryFn, { METHOD } from '../react-query/WeConnectQuery';
import { ErrorMessage } from './Style/sharedStyles';

const VerifySecretCodeModal = ({ classes, person }) => {
  renderLog('VerifySecretCodeModal');
  const { getAppContextValue, setAppContextValue } = useConnectAppContext();

  const d1FldRef = useRef('');
  const d2FldRef = useRef('');
  const d3FldRef = useRef('');
  const d4FldRef = useRef('');
  const d5FldRef = useRef('');
  const d6FldRef = useRef('');
  const buttonRef = useRef();

  const [nextFocus, setNextFocus] = useState(1);
  const [condensed] = useState(true);
  const [voterPhoneNumber] = useState(undefined);
  const [voterEmailAddress] = useState(true);
  const [openDialogMutable, setOpenDialogMutable] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const digits = [[1, 'd1Id', d1FldRef], [2, 'd2Id', d2FldRef], [3, 'd3Id', d3FldRef], [4, 'd4Id', d4FldRef], [5, 'd5Id', d5FldRef], [6, 'd6Id', d6FldRef]];

  const open = getAppContextValue('openVerifySecretCodeModalDialog');
  useEffect(() => {
    setOpenDialogMutable(getAppContextValue('openVerifySecretCodeModalDialog'));
    setAppContextValue('secretCodeVerified', false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleClose = () => {
    console.log('handleClose pressed');
    setOpenDialogMutable(false);
    setAppContextValue('openVerifySecretCodeModalDialog', false);
  };

  const verifySecretCode = async () => {
    console.log('verifySecretCode pressed');
    let code = '';
    for (let i = 0; i < digits.length; i++) {
      const digit = digits[i];
      const refDigit = digit[2];
      code += refDigit.current.value.toString();
    }

    const id = person.personId || person.id;
    const data = await weConnectQueryFn('verify-email-code', { personId: id, code }, METHOD.POST);
    console.log(`/verify-email-code response: data: ${JSON.stringify(data)}`);
    if (data.emailVerified) {
      setAppContextValue('secretCodeVerified', true);
      setAppContextValue('secretCodeVerifiedForReset', true);
      setOpenDialogMutable(false);
    } else {
      setErrorMessage('Your code did not verify.  Try again.');
    }
  };

  useEffect(() => {
    while (d1FldRef?.current && openDialogMutable) {
      setTimeout(() => {
        // See https://github.com/mui/material-ui/issues/33004#issuecomment-1455260156
        d1FldRef.current?.focus();
      }, 50);
    }
  }, []);

  useEffect(() => {
    if (nextFocus <= 6) {
      // eslint-disable-next-line no-unused-vars
      const [index, id, refNext] = digits.find((dig) => dig[0] === nextFocus);
      if (refNext && refNext.current) {
        setTimeout(() => {
          // See https://github.com/mui/material-ui/issues/33004#issuecomment-1455260156
          refNext.current.focus();
        }, 50);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextFocus]);

  const extractDigits = (str) => {
    const digitsLocal = str.match(/\d{6}/g);
    return digitsLocal?.length ? digitsLocal.join('') : '';
  };

  const onPaste = (event) => {
    const clipboardData = (event.originalEvent || event).clipboardData.getData('text/plain');
    const pastedData = extractDigits(clipboardData);

    for (let i = 0; i < pastedData.length; i++) {
      const digit = digits[i];
      const refDigit = digit[2];
      refDigit.current.value = pastedData[i];
    }

    if (pastedData.length === 6) {
      buttonRef.current.focus();
    }
  };

  const onDigitChange = (event) => {
    // eslint-disable-next-line no-unused-vars
    const [index, id, refThis] = digits.find((dig) => dig[1] === event.target.id);
    const ch = refThis.current.value[0];
    if (ch && Number.isNaN(ch - '0')) {
      refThis.current.value = '';
    } else {
      refThis.current.blur();
      setNextFocus(index + 1);
    }
    setErrorMessage('');
    console.log(event);
  };

  if (!openDialogMutable || !person || Object.keys(person).length === 0) {
    return null;
  }

  return (
    <Modal
      open={openDialogMutable}
      aria-labelledby="parent-modal-title"
      aria-describedby="parent-modal-description"
    >
      <Dialog
        id="codeVerificationDialog"
        open={openDialogMutable}
        className="u-z-index-9030"
        classes={{
          paper: clsx(classes.dialogPaper, {
            [classes.codeVerifyCordova]: isCordova(),
          }),
          root: classes.dialogRoot,
        }}
      >
        <ModalTitleArea $condensed={condensed}>
          <Button onClick={handleClose} id="emailVerificationBackButton">
            [X]
          </Button>
        </ModalTitleArea>
        <ModalContent $condensed={condensed} style={{ padding: `${isWebApp() ? 'undefined' : '37px 0 2px 0'}` }}>
          <TextContainer>
            <Title $condensed={condensed}>Code Verification</Title>
            <Subtitle>A 6-digit code has been sent to</Subtitle>
            <EmailSubtitle>{person?.email}</EmailSubtitle>

            {(voterEmailAddress) ? (
              <Subtitle>If you haven&apos;t received the code in 30 seconds, please check your spam folder and mark the email as &apos;Not Spam&apos;.</Subtitle>
            ) : (
              <>
                {(voterPhoneNumber) && (
                  <Subtitle>If you haven&apos;t received the code within 30 seconds, please verify the number you entered.</Subtitle>
                )}
              </>
            )}
            <InputContainer>
              {digits.map((dig) => (
                <OutlinedInput
                  autoFocus={dig[0] === 0}
                  classes={{ root: classes.inputBase, input: classes.input }}
                  id={dig[1]}
                  inputProps={{ maxLength: 1 }}
                  inputRef={dig[2]}
                  key={dig[1]}
                  label={false}
                  notched={false}
                  onChange={onDigitChange}
                  onPaste={onPaste}
                  type="tel"
                  // onFocus="this.select()"
                  // maxLength={1}
                  // value={this.state.digit1}
                  // onBlur={this.handleBlur}
                />
              ))}
            </InputContainer>
          </TextContainer>
          <ErrorMessage>{errorMessage}</ErrorMessage>
          <ButtonsContainer $condensed={condensed}>
            <Button
              classes={{ root: classes.verifyButton }}
              id="emailVerifyButton"
              color="primary"
              ref={buttonRef}
              fullWidth
              onClick={verifySecretCode}
              variant="contained"
            >
              Verify
            </Button>
          </ButtonsContainer>
        </ModalContent>
      </Dialog>
    </Modal>
  );
};
VerifySecretCodeModal.propTypes = {
  classes: PropTypes.object,
  person: PropTypes.object,
};

const styles = (theme) => ({
  dialogPaper: {
    marginTop: 48, // hasIPhoneNotch() ? 68 : 48,
    [theme.breakpoints.up('sm')]: {
      maxWidth: '720px',
      width: '85%',
      minHeight: '90%',
      maxHeight: '90%',
      height: '90%',
      margin: '0 auto',
    },
    [theme.breakpoints.down('sm')]: {
      minWidth: '95%',
      maxWidth: '95%',
      width: '95%',
      minHeight: '90%',
      maxHeight: '90%',
      height: '90%',
      margin: '0 auto',
    },
  },
  dialogRoot: {
    zIndex: '9030 !important',
  },
  codeVerifyCordova: {
    // top: '9%', Removed 12/13/23 to reduce vertical vibration on digit entry field advance
    bottom: 'unset',
    height: 'unset',
    minHeight: 'unset',
    margin: '5px',
  },
  inputBase: {
    alignContent: 'center',
    display: 'flex',
    // flex: '0 0 1',
    justifyContent: 'center',
    margin: '0 4px',
    // maintain aspect ratio
    width: '10vw',
    height: '10vw',
    maxWidth: 53,
    maxHeight: 53,
    fontSize: 22,
    '@media(min-width: 569px)': {
      margin: '0 8px',
      fontSize: 35,
    },
    '&:first-child': {
      marginLeft: 0,
    },
    '&:last-child': {
      marginRight: 0,
    },
    background: '#f7f7f7',
  },
  input: {
    textAlign: 'center',
    padding: '8px 0',

  },
  button: {
    width: '100%',
    border: '1px solid #ddd',
    fontWeight: 'bold',
    margin: '6px 0',
  },
  verifyButton: {
    textAlign: 'center',
    margin: '25px 0',
    width: 200,
  },
});

const InputContainer = styled('div', {
  shouldForwardProp: (prop) => !['condensed'].includes(prop),
})(({ condensed }) => (`
  display: flex;
  justify-content: space-between;
  margin: auto;
  width: 100%;
  margin-top: ${condensed ? '16px' : '32px'};
`));

const ModalTitleArea = styled('div', {
  shouldForwardProp: (prop) => !['condensed'].includes(prop),
})(({ condensed }) => (`
  width: 100%;
  padding: ${condensed ? '8px' : '12px'};
  box-shadow: 0 20px 40px -25px #999;
  z-index: 999;
  display: flex;
  justify-content: flex-start;
  position: absolute;
  top: 0;
`));

const ModalContent = styled('div', {
  shouldForwardProp: (prop) => !['condensed'].includes(prop),
})(({ condensed }) => (`
  display: flex;
  flex-direction: column;
  align-items: ${condensed ? 'flex-start' : 'space-evenly'};
  height: ${isWebApp() ?  '100%' : 'unset'};
  width: 80%;
  max-width: 400px;
  margin: 0 auto;
  padding: ${condensed ? '66px 0 0 0' : '86px 0 72px 0'};
`));

const TextContainer = styled('div')`
`;

const ButtonsContainer = styled('div', {
  shouldForwardProp: (prop) => !['condensed'].includes(prop),
})(({ condensed }) => (`
  margin-top: ${condensed ? '32px' : 'auto'};
  display: flex;
  display: flex;
  justify-content: center;
  width: 100%
`));

const Title = styled('h3', {
  shouldForwardProp: (prop) => !['condensed'].includes(prop),
})(({ condensed }) => (`
  font-weight: bold;
  font-size: ${() => (isIPhone4in() ? '26px' : '30px')};
  padding: 0 10px;
  margin-bottom: ${condensed ? '16px' : '36px'};
  color: black;
  text-align: center;
  @media(min-width: 569px) {
    font-size: 36px;
  }
`));

const Subtitle = styled('h4')`
  color: #424242;
  text-align: center;
`;

const EmailSubtitle = styled('h4')`
  color: black;
  font-weight: bold;
  text-align: center;
`;

export default withTheme(withStyles(styles)(VerifySecretCodeModal));
