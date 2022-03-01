import { Command } from '../types';
import React from 'react';
import threadIcon from '../../../icons/thread.svg';

const Icon = () => <img src={threadIcon} />;

export const Spider: Command = {
  command: 'Thread',
  title: 'Thread',
  icon: <Icon />,
  description: 'run a thread on your ship',
  arguments: ['thread name', 'desk', 'input mark', 'output mark', 'body'],
  schema: [
    (props: any[]) => ({
      threadName: props[0].innerHTML,
      desk: props[1].innerHTML,
      inputMark: props[2].innerHTML,
      outputMark: props[3].innerHTML,
      body: JSON.parse(props[4].innerHTML),
    }),
  ],
};
