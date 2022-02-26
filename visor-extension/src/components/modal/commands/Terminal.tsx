import { Command } from '../types';
import React from 'react';

const Icon = () => (
  <svg className="icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" />
  </svg>
);

export const Terminal: Command = {
  command: 'poke',
  title: 'Terminal',
  icon: Icon,
  description: 'connect to dojo terminal',
  arguments: ['command'],
  schema: [
    (props: any[]) => ({ app: 'herm', mark: 'belt', json: { txt: [props[0].innerHTML] } }),
    (props: any[]) => ({ app: 'herm', mark: 'belt', json: { ret: null } }),
  ],
};
