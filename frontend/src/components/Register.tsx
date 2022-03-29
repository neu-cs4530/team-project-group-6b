import { useAuth0 } from '@auth0/auth0-react';
import { Box, Button, FormLabel, Heading, Input, Text } from '@chakra-ui/react';
import { Form, FormikProps, withFormik } from 'formik';
import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import ProfileServiceClient from '../classes/ProfileServiceClient';

const profileServiceClient = new ProfileServiceClient();

interface FormValues {
  username: string;
  firstName: string;
  lastName: string;
}

// Aside: You may see InjectedFormikProps<OtherProps, FormValues> instead of what comes below in older code.. InjectedFormikProps was artifact of when Formik only exported a HoC. It is also less flexible as it MUST wrap all props (it passes them through).
const InnerForm = (props: FormikProps<FormValues>) => {
  const { isSubmitting, handleBlur, handleChange } = props;
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <Box p='4' borderWidth='1px' borderRadius='lg' maxWidth='800'>
        <Form>
          <Heading as='h2' size='lg'>
            Enter your profile information
          </Heading>
          <FormLabel>Username</FormLabel>
          <Input name='username' onChange={handleChange} onTouchStart={handleBlur} />
          <FormLabel>First Name</FormLabel>
          <Input name='firstName' onChange={handleChange} onTouchStart={handleBlur} />
          <FormLabel>Last Name</FormLabel>
          <Input name='lastName' onChange={handleChange} onTouchStart={handleBlur} />

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
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const Wrapper = withFormik<any, FormValues>({
    handleSubmit: async values => {
      const token = await getAccessTokenSilently();
      try {
        if (!user || !user.email) {
          throw new Error('no user');
        }
        await profileServiceClient.postProfile({
          token,
          email: user.email,
          username: values.username,
          firstName: values.firstName,
          lastName: values.lastName,
        });
        setShouldRedirect(true);
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
