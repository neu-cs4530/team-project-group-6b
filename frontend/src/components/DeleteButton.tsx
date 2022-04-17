import { Popover, IconButton, Icon } from '@chakra-ui/react';
import { MdDeleteOutline } from 'react-icons/md';
import React from 'react';

function DeleteButton(props: { onConfirm: () => any }) {
  return <IconButton aria-label='delete' icon={<Icon as={MdDeleteOutline} color='red' />} />;
}

export default DeleteButton;
