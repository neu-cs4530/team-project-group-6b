import { useAuth0 } from '@auth0/auth0-react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import { Form, FormikProps, withFormik } from 'formik';
import React, { useContext, useState } from 'react';
import { Redirect } from 'react-router-dom';
import ProfileServiceClient from '../classes/ProfileServiceClient';
import AuthenticateduserContext from '../contexts/AuthenticatedUserContext';

const profileServiceClient = new ProfileServiceClient();

interface FormValues {
  username: string;
  firstName: string;
  lastName: string;
  pronouns: string;
  occupation: string;
  bio: string;
}

// Aside: You may see InjectedFormikProps<OtherProps, FormValues> instead of what comes below in older code.. InjectedFormikProps was artifact of when Formik only exported a HoC. It is also less flexible as it MUST wrap all props (it passes them through).
const InnerForm = (props: FormikProps<FormValues>) => {
  const { isSubmitting, handleBlur, handleChange } = props;
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <Box p='4' borderWidth='1px' borderRadius='lg' maxWidth='800'>
        <Form>
          <Heading as='h2' size='lg'>
            Enter your registration information
          </Heading>
          <FormControl isRequired>
            <FormLabel>First Name</FormLabel>
            <Input name='firstName' onChange={handleChange} onTouchStart={handleBlur} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Last Name</FormLabel>
            <Input name='lastName' onChange={handleChange} onTouchStart={handleBlur} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Username</FormLabel>
            <Input name='username' onChange={handleChange} onTouchStart={handleBlur} />
          </FormControl>
          <FormLabel>Pronouns</FormLabel>
          <Input name='pronouns' onChange={handleChange} onTouchStart={handleBlur} />
          <FormLabel>Occupation</FormLabel>
          <Input name='occupation' onChange={handleChange} onTouchStart={handleBlur} />
          <FormLabel>Bio</FormLabel>
          <Textarea
            name='bio'
            onChange={handleChange}
            onTouchStart={handleBlur}
            placeholder='Give users a small bio about you'
          />
          <Button type='submit' disabled={isSubmitting}>
            Submit
          </Button>
        </Form>
      </Box>
    </div>
  );
};

// Wrap our form with the withFormik HoC
const OuterForm = () => {
  const { getAccessTokenSilently, user } = useAuth0();
  const { refresh } = useContext(AuthenticateduserContext);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const toast = useToast();
  const Wrapper = withFormik<any, FormValues>({
    handleSubmit: async values => {
      const token = await getAccessTokenSilently();
      try {
        if (!user || !user.email) {
          throw new Error('no user');
        }
        if (values.firstName === '' || values.lastName === '' || values.username === '') {
          toast({
            title: 'Incomplete information.',
            description: 'Please fill in the required fields.',
            status: 'error',
            duration: 9000,
            isClosable: true,
          });
        } else {
          await profileServiceClient.postProfile({
            token,
            email: user.email,
            username: values.username,
            firstName: values.firstName,
            lastName: values.lastName,
            pronouns: values.pronouns,
            occupation: values.occupation,
            bio: values.bio,
          });
          toast({
            title: 'Registration Complete.',
            description: 'Profile successfully created.',
            status: 'success',
            duration: 9000,
            isClosable: true,
          });
          await refresh();
          setShouldRedirect(true);
        }
      } catch (err) {
        setError('something bad happened');
      }
    },
  })(InnerForm);
  return (
    <>
      {error && <Text>{error}</Text>}
      {shouldRedirect && <Redirect to='/' />}
      <Wrapper />
    </>
  );
};

// Use <MyForm /> wherevs
const Wrapper = () => (
  <div>
    <Heading>My App</Heading>
    <OuterForm />
  </div>
);

export default Wrapper;
