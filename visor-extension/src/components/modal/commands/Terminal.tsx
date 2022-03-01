import { Command } from '../types';
import React from 'react';
import terminalIcon from '../../../icons/terminal.svg';

const Icon = () => <img src={terminalIcon} />;

export const Terminal: Command = {
  command: 'poke',
  title: 'Terminal',
  icon: <Icon />,
  description: 'connect to dojo terminal',
  arguments: ['command'],
  schema: [
    (props: any[]) => ({ app: 'herm', mark: 'belt', json: { txt: [props[0].innerHTML] } }),
    (props: any[]) => ({ app: 'herm', mark: 'belt', json: { ret: null } }),
  ],
};
