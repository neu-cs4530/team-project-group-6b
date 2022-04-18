import { useAuth0 } from '@auth0/auth0-react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import ProfileServiceClient from '../classes/ProfileServiceClient';
import AuthenticatedUserContext from '../contexts/AuthenticatedUserContext';

const profileServiceClient = new ProfileServiceClient();

interface FormValues {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  pronouns: string;
  bio: string;
}

// Aside: You may see InjectedFormikProps<OtherProps, FormValues> instead of what comes below in older code.. InjectedFormikProps was artifact of when Formik only exported a HoC. It is also less flexible as it MUST wrap all props (it passes them through).
const ProfileForm = () => {
  const authenticatedUser = useContext(AuthenticatedUserContext);
  const [error, setError] = useState<string | undefined>(undefined);
  const [message, setMessage] = useState<string | undefined>(undefined);
  const { getAccessTokenSilently, user } = useAuth0();

  // https://chakra-ui.com/docs/components/feedback/toast
  const toast = useToast();
  return (
    <Formik
      enableReinitialize
      onSubmit={(values: FormValues) => {}}
      initialValues={{
        username: authenticatedUser.profile?.username || '',
        firstName: authenticatedUser.profile?.firstName || '',
        lastName: authenticatedUser.profile?.lastName || '',
        email: authenticatedUser.profile?.email || '',
        pronouns: authenticatedUser.profile?.pronouns || '',
        occupation: authenticatedUser.profile?.occupation || '',
        bio: authenticatedUser.profile?.bio || '',
      }}>
      {({ handleChange, handleBlur, values, isSubmitting }) => (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Box p='4' borderWidth='1px' borderRadius='lg' maxWidth='800'>
            {console.log('usercontextuser: ', authenticatedUser)}
            <Form>
              <FormControl isRequired>
                <FormLabel>First Name</FormLabel>
                <Input
                  id='firstName'
                  name='firstName'
                  onChange={handleChange}
                  onTouchStart={handleBlur}
                  value={values.firstName}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Last Name</FormLabel>
                <Input
                  id='lastName'
                  name='lastName'
                  onChange={handleChange}
                  onTouchStart={handleBlur}
                  value={values.lastName}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Username</FormLabel>
                <Input
                  id='username'
                  name='username'
                  onChange={handleChange}
                  onTouchStart={handleBlur}
                  value={values.username}
                />
              </FormControl>
              <FormLabel>Email</FormLabel>
              <Input
                name='email'
                onChange={handleChange}
                onTouchStart={handleBlur}
                value={values.email}
                disabled
              />
              <FormLabel>Pronouns</FormLabel>
              <Input
                name='pronouns'
                onChange={handleChange}
                onTouchStart={handleBlur}
                value={values.pronouns}
              />
              <FormLabel>Occupation</FormLabel>
              <Input
                name='occupation'
                onChange={handleChange}
                onTouchStart={handleBlur}
                value={values.occupation}
              />
              <FormLabel>Bio</FormLabel>
              <Textarea
                name='bio'
                onChange={handleChange}
                onTouchStart={handleBlur}
                value={values.bio}
                placeholder='Give users a small bio about you'
              />
              <Button
                // type='submit'
                // disabled={isSubmitting}
                onClick={async () => {
                  const token = await getAccessTokenSilently();
                  if (!user || !user.email) {
                    throw new Error('no user');
                  }
                  try {
                    const result = await profileServiceClient.patchProfile({
                      token,
                      email: user.email,
                      username: values.username,
                      firstName: values.firstName,
                      lastName: values.lastName,
                      pronouns: values.pronouns,
                      occupation: values.occupation,
                      bio: values.bio,
                    });
                    authenticatedUser.refresh();
                    console.log(result);
                    if (result.acknowledged) {
                      toast({
                        title: 'Account updated.',
                        description: "We've updated your account for you.",
                        status: 'success',
                        duration: 9000,
                        isClosable: true,
                      });
                      authenticatedUser.refresh();
                    } else {
                      toast({
                        title: 'Missing information.',
                        description: 'Please fill out all text fields.',
                        status: 'error',
                        duration: 9000,
                        isClosable: true,
                      });
                    }
                  } catch (err) {
                    setError('shit hit the fan');
                  }
                }}>
                Update
              </Button>
              {/* <Link to='/' style={{ paddingLeft: 20 }}>
                Back to home
              </Link> */}
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
    <Heading>Profile</Heading>
    <ProfileForm />
  </div>
);

export default Wrapper;
