import { Command } from '../types';
import React from 'react';
import urbitTilde from '../../../icons/urbit-tilde.svg';

const Icon = () => <img src={urbitTilde} />;

export const Welcome: Command = {
  title: 'Welcome To Urbit Visor Command Launcher',
  icon: <Icon />,
  description:
    'Use the up/down keys, or type the name, to select a command to run on your Urbit ship.',
};
