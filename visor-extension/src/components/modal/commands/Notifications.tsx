import { Command } from '../types';
import React from 'react';
import notificationsIcon from '../../../icons/notifications.svg';

const Icon = () => <img src={notificationsIcon} />;

export const Notifications: Command = {
  title: 'Notifications',
  icon: <Icon />,
  description: 'open notifications',
};
