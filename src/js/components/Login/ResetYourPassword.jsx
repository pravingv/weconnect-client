import { Modal } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import validator from 'validator';
import { renderLog } from '../../common/utils/logging';
import { useConnectAppContext } from '../../contexts/ConnectAppContext';
import makeRequestParams from '../../react-query/makeRequestParams';
import { useLogoutMutation, usePersonRetrieveByEmailMutation, usePersonSaveForAuthMutation } from '../../react-query/mutations';
import weConnectQueryFn, { METHOD } from '../../react-query/WeConnectQuery';
import { ErrorMessage } from '../Style/sharedStyles';
import VerifySecretCodeModal from '../VerifySecretCodeModal';

const ResetYourPassword = ({ openDialog, closeDialog }) => {
  renderLog('ResetYourPassword');
  const { mutate: mutateRetrievePersonByEmail } = usePersonRetrieveByEmailMutation();
  const { mutate: mutatePersonSaveForAuth } = usePersonSaveForAuthMutation();
  const { mutate: mutateLogout } = useLogoutMutation();
  const { getAppContextValue, setAppContextValue } = useConnectAppContext();

  const [open, setOpen] = React.useState(openDialog);
  const [displayEmailAddress, setDisplayEmailAddress] = useState(true);
  const [warningLine, setWarningLine] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const emailRef = useRef('');
  const password1Ref = useRef('');
  const password2Ref = useRef('');
  const authPerson = useRef(undefined);

  useEffect(() => {
    setOpen(openDialog);
  }, [openDialog]);

  const secretCodeVerified = getAppContextValue('secretCodeVerifiedForReset') || false;
  useEffect(() => {
    if (secretCodeVerified === true) {
      console.log('received new secretCodeVerifiedForReset', secretCodeVerified);
      setDisplayEmailAddress(false);
      emailRef.current = '';
      password1Ref.current = '';
      password2Ref.current = '';
    }
  }, [secretCodeVerified]);

  const auth = getAppContextValue('authenticatedPerson');
  useEffect(() => {
    const authP = getAppContextValue('authenticatedPerson');
    if (authP && open) {
      console.log('received new authP', authP);
      authPerson.current = authP;
      console.log('authPerson.personId in Login useEffect [auth] id: ', authP.personId);
      console.log('authPerson.personId in Login useEffect [auth] open: ', open);
      weConnectQueryFn('send-email-code', { personId: authP.personId }, METHOD.POST)
        .then(setAppContextValue('openVerifySecretCodeModalDialog', true));
    }
    // eslint would have us add getAppContextValue and setAppContextValue, which causes and endless loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]);

  const sendEmail = async () => {
    const email = emailRef.current.value;
    setAppContextValue('resetEmail', email);
    console.log('email in sendEmail: ', emailRef.current.value);
    if (!validator.isEmail(email)) {
      setWarningLine('Please enter a valid email address.');
      return;
    }
    setWarningLine('');
    setAppContextValue('openVerifySecretCodeModalDialog', true);
    // Logout so that the current sessionID will not be reused when resetting password for a potentially differnt staff member
    await mutateLogout();
    // This retrieve will set the 'authenticatedPerson' app context value, and bring back a new sessionID (without touching the cookie)
    await mutateRetrievePersonByEmail({ emailPersonal: email });
  };

  const handleClose = () => {
    setOpen(false);
    closeDialog(false);
  };

  const changePassword = async () => {
    const pass1 = password1Ref.current.value;
    const pass2 = password2Ref.current.value;
    const person = authPerson.current;

    console.log('password in changePassword: ', pass1, pass2);
    if (pass1 !== pass2) {
      setErrorMessage('Your password entries do not match.');
    } else {
      setErrorMessage('');
      // const person = getAppContextValue('authenticatedPerson');
      await mutatePersonSaveForAuth(makeRequestParams({ id: person.id }, { password: pass1 }));
      setAppContextValue('isAuthenticated', true);
      console.log('ResetYourPassword changePassword pass1, pass2: ',  pass1, pass2);
      setAppContextValue('resetPassword', pass1);
      handleClose();
    }
  };

  console.log('ResetYourPassword incoming authPerson: ', authPerson);
  return (
    <>
      <Modal
        open={open}
        // onClose={handleClose}
        aria-labelledby="parent-modal-title"
        aria-describedby="parent-modal-description"
      >
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle sx={{ width: '400px' }}>Reset your Password</DialogTitle>
          <div id="warningLine" style={{ color: 'red', padding: '10px 0 0 30px', paddingBottom: '20px' }}>{warningLine}</div>
          <DialogContent>
            <DialogContentText sx={{ marginBottom: '15px' }}>
              {displayEmailAddress ? 'Please enter your email address.' : 'Please enter your new password.'}
            </DialogContentText>
            <ErrorMessage>{errorMessage}</ErrorMessage>
            { displayEmailAddress ? (
              <TextField
                autoFocus
                fullWidth
                id="email"
                inputRef={emailRef}
                label="Email Address"
                margin="dense"
                name="email"
                required
                type="email"
                variant="standard"
              />
            ) : (
              <form>
                <TextField
                  autoFocus
                  fullWidth
                  id="field1"
                  inputRef={password1Ref}
                  label="Password"
                  margin="dense"
                  name="password1"
                  required
                  type="password"
                  variant="standard"
                />
                <TextField
                  fullWidth
                  id="field2"
                  inputRef={password2Ref}
                  label="Verify Password"
                  margin="dense"
                  name="password2"
                  required
                  type="password"
                  variant="standard"
                />
              </form>
            )}
            <Button sx={{ float: 'right' }} onClick={displayEmailAddress ? sendEmail : changePassword}>
              {displayEmailAddress ? 'Send reset email' : 'Save your new password'}
            </Button>
          </DialogContent>
        </Dialog>
      </Modal>
      <VerifySecretCodeModal person={authPerson.current}  />
    </>
  );
};
ResetYourPassword.propTypes = {
  openDialog: PropTypes.func,
  closeDialog: PropTypes.func,
};

export default ResetYourPassword;
