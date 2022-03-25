import { Box, Button, FormLabel, Heading, Input } from '@chakra-ui/react';
import { Form, FormikProps, withFormik } from 'formik';
import React from 'react';

interface FormValues {
  email: string;
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
          <FormLabel>Email</FormLabel>
          <Input name='email' onChange={handleChange} onTouchStart={handleBlur} />
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
const OuterForm = withFormik<Record<string, never>, FormValues>({
  handleSubmit: values => {
    // do submitting things
    alert(JSON.stringify(values));
  },
})(InnerForm);

// Use <MyForm /> wherevs
const Wrapper = () => (
  <div>
    <Heading>My App</Heading>
    <OuterForm />
  </div>
);

export default Wrapper;
