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
import styled from 'styled-components';
import validator from 'validator';
import { renderLog } from '../../common/utils/logging';
import { useConnectAppContext } from '../../contexts/ConnectAppContext';
import { useLogoutMutation, usePasswordSaveMutation, usePersonRetrieveByEmailMutation } from '../../react-query/mutations';
import weConnectQueryFn, { METHOD } from '../../react-query/WeConnectQuery';
import { ErrorMessage } from '../Style/sharedStyles';
import VerifySecretCodeModal from '../VerifySecretCodeModal';

const ResetYourPassword = ({ openDialog, closeDialog }) => {
  renderLog('ResetYourPassword');
  const { mutate: mutateRetrievePersonByEmail } = usePersonRetrieveByEmailMutation();
  const { mutate: mutatePasswordSave } = usePasswordSaveMutation();
  const { mutate: mutateLogout } = useLogoutMutation();
  const { getAppContextValue, setAppContextValue } = useConnectAppContext();
  // console.log('ResetYourPassword ', getAppContextData());

  const [open, setOpen] = React.useState(openDialog);
  const [displayEmailAddress, setDisplayEmailAddress] = useState(true);
  const [warningLine, setWarningLine] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [personId, setPersonId] = useState('');

  const emailRef = useRef('');
  const emailDisabledRef = useRef('');
  const password1Ref = useRef('');
  const password2Ref = useRef('');
  const authPersonRef = useRef(undefined);

  useEffect(() => {
    setOpen(openDialog);
  }, [openDialog]);

  const secretCodeVerified = getAppContextValue('secretCodeVerifiedForReset') || false;
  useEffect(() => {
    if (secretCodeVerified === true) {
      console.log('received new secretCodeVerifiedForReset', secretCodeVerified);
      setDisplayEmailAddress(false);
      emailDisabledRef.current = authPersonRef.current?.emailPersonal || '';
      emailRef.current = '';
      password1Ref.current = '';
      password2Ref.current = '';
    }
  }, [secretCodeVerified]);

  const auth = getAppContextValue('authenticatedPerson');
  useEffect(() => {
    const authP = getAppContextValue('authenticatedPerson');
    authPersonRef.current = authP;
    if (authP && open) {
      setPersonId(authP.id);
      weConnectQueryFn('send-email-code', { personId: authP.id }, METHOD.POST)
        .then(setAppContextValue('openVerifySecretCodeModalDialog', true));
    }
    // eslint would have us add getAppContextValue and setAppContextValue, which causes and endless loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]);


  const handleClose = () => {
    setOpen(false);
    closeDialog(false);
  };

  const changePassword = async () => {
    const pass1 = password1Ref.current.value;
    const pass2 = password2Ref.current.value;
    const person = authPersonRef.current;
    let id;
    if (person?.id) {
      id = person.id;
    } else {
      id = personId;
    }

    if (pass1 !== pass2) {
      setErrorMessage('Your password entries do not match.');
    } else {
      setErrorMessage('');
      await mutatePasswordSave({ personId: id, password: pass1 });
      setAppContextValue('isAuthenticated', true);
      if (person && person.id) {
        person.personId = person.id;    // Initialize legacy (redundant) 'personId' field, which is not in the database
      }
      setAppContextValue('authenticatedPerson', person);
      setAppContextValue('resetPassword', pass1);
      handleClose();
    }
  };

  const sendEmail = async () => {
    const email = emailRef.current.value;
    setAppContextValue('resetEmail', email);
    if (!validator.isEmail(email)) {
      setWarningLine('Please enter a valid email address.');
      return;
    }
    setWarningLine('');
    setAppContextValue('openVerifySecretCodeModalDialog', true);
    // Logout so that the current sessionID will not be reused when resetting password for a potentially differnt staff member
    await mutateLogout();
    // This retrieve will set the 'authenticatedPerson' app context value, and bring back a new sessionID (without touching the cookie)
    // console.log('mutateRetrievePersonByEmail: retrieving person by email:', email);
    // Note: ResetYourPassword can only be used with emailPersonal so far.
    //  Needs to be extended to include emailOfficial.
    await mutateRetrievePersonByEmail({ emailPersonal: email });
    // await mutateRetrievePersonByEmail({
    //   OR: [
    //     { emailPersonal: email },
    //     { emailOfficial: email },
    //   ]});
    // TODO: If person is not found by this email, show a warning message asking the user to enter a different email
    // setWarningLine('Email not found. Please enter different email address.');
  };

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
                variant="outlined"
              />
            ) : (
              <>
                {/* EmailDiv clues in Google "Update password?" dialog to display this email, it probably could be css hidden */}
                <EmailDiv id="username">Email: &nbsp;&nbsp;&nbsp;{emailDisabledRef.current}</EmailDiv>
                <TextField
                  autoFocus
                  fullWidth
                  id="field1"
                  inputRef={password1Ref}
                  label="Password"
                  // type="password"
                  margin="dense"
                  name="password1"
                  required
                  variant="outlined"
                  // sx={{ '-webkit-text-security': 'disc' }}
                />
                <TextField
                  fullWidth
                  id="field2"
                  inputRef={password2Ref}
                  label="Verify Password"
                  // type="password"
                  margin="dense"
                  name="password2"
                  required
                  variant="outlined"
                  // sx={{ '-webkit-text-security': 'disc' }}
                />
              </>
            )}
            <Button sx={{ float: 'right' }} onClick={displayEmailAddress ? sendEmail : changePassword}>
              {displayEmailAddress ? 'Send reset email' : 'Save your new password'}
            </Button>
          </DialogContent>
        </Dialog>
      </Modal>
      <VerifySecretCodeModal person={authPersonRef.current}  />
    </>
  );
};
ResetYourPassword.propTypes = {
  openDialog: PropTypes.bool,
  closeDialog: PropTypes.func,
};

const EmailDiv  = styled('div')`
  padding: 0 0 20px 0;
  font-family: "Roboto", "Helvetica", "Arial", sans-serif;
  font-weight: 400;
  font-size: 1rem;
  line-height: 1.5;
  letter-spacing: 0.00938em;
  color: rgba(0, 0, 0, 0.6);
`;


export default ResetYourPassword;
