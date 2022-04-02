import { Box, Button, FormLabel, Heading, Input, Textarea, useToast } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import React, { useContext, useState } from 'react';
import ProfileServiceClient from '../classes/ProfileServiceClient';
import AuthenticatedUserContext from '../contexts/AuthenticatedUserContext';

const profileServiceClient = new ProfileServiceClient();

interface FormValues {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
}

// Aside: You may see InjectedFormikProps<OtherProps, FormValues> instead of what comes below in older code.. InjectedFormikProps was artifact of when Formik only exported a HoC. It is also less flexible as it MUST wrap all props (it passes them through).
const ProfileForm = () => {
  const authenticatedUser = useContext(AuthenticatedUserContext);
  const [error, setError] = useState<string | undefined>(undefined);
  const [message, setMessage] = useState<string | undefined>(undefined);
  // https://chakra-ui.com/docs/components/feedback/toast
  const toast = useToast();
  return (
    <Formik
      enableReinitialize
      onSubmit={(values: FormValues) => {}}
      initialValues={{
        username: authenticatedUser?.username || '',
        firstName: authenticatedUser?.firstName || '',
        lastName: authenticatedUser?.lastName || '',
        email: authenticatedUser?.email || '',
        bio: authenticatedUser?.bio || '',
      }}>
      {({ handleChange, handleBlur, values, isSubmitting }) => (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Box p='4' borderWidth='1px' borderRadius='lg' maxWidth='800'>
            {console.log('usercontextuser: ', authenticatedUser)}
            <Form>
              <Heading as='h2' size='lg'>
                Hi {values.firstName}, edit your profile information
              </Heading>
              <FormLabel>First Name</FormLabel>
              <Input
                name='firstName'
                onChange={handleChange}
                onTouchStart={handleBlur}
                value={values.firstName}
              />
              <FormLabel>Last Name</FormLabel>
              <Input
                name='lastName'
                onChange={handleChange}
                onTouchStart={handleBlur}
                value={values.lastName}
              />
              <FormLabel>Username</FormLabel>
              <Input
                name='username'
                onChange={handleChange}
                onTouchStart={handleBlur}
                value={values.username}
              />
              <FormLabel>Email</FormLabel>
              <Input
                name='email'
                onChange={handleChange}
                onTouchStart={handleBlur}
                value={values.email}
                disabled
              />
              <FormLabel>Bio</FormLabel>
              <Textarea
                name='bio'
                onChange={handleChange}
                onTouchStart={handleBlur}
                placeholder='Give users a small bio about you'
              />
              <Button
                // type='submit'
                // disabled={isSubmitting}
                onClick={() => {
                  if (values.bio) {
                    toast({
                      title: 'Account updated.',
                      description: "We've updated your account for you.",
                      status: 'success',
                      duration: 9000,
                      isClosable: true,
                    });
                  } else {
                    toast({
                      title: 'Missing information.',
                      description: 'Please fill out all text fields.',
                      status: 'error',
                      duration: 9000,
                      isClosable: true,
                    });
                  }
                }}>
                Submit
              </Button>
            </Form>
          </Box>
        </div>
      )}
    </Formik>
  );
};

// // Wrap our form with the withFormik HoC
// const OuterForm = () => {
//   const { getAccessTokenSilently, user } = useAuth0();
//   const [shouldRedirect, setShouldRedirect] = useState(false);
//   const [error, setError] = useState<string | undefined>(undefined);
//   const Wrapper = withFormik<any, FormValues>({

//   })(InnerForm);
//   return (
//     <>
//       {error && <Text>{error}</Text>}
//       {shouldRedirect && <Redirect to='/' />}
//       <Wrapper />
//     </>
//   );
// };

// Use <MyForm /> wherevs
const Wrapper = () => (
  <div>
    <Heading>My App</Heading>
    <ProfileForm />
  </div>
);

export default Wrapper;
