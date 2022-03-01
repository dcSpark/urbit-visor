import { Command } from '../types';
import React from 'react';
import subscriptionIcon from '../../../icons/subscription.svg';

const Icon = () => <img src={subscriptionIcon} />;

export const Subscribe: Command = {
  command: 'subscribe',
  title: 'Subscription',
  icon: <Icon />,
  description: 'subscribe to updates from an agent on your ship',
  arguments: ['app', 'path'],
  schema: [(props: any[]) => ({ app: props[0].innerHTML, path: props[1].innerHTML })],
};
