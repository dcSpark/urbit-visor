import { Command } from '../types';
import React from 'react';
import pokeIcon from '../../../icons/poke.svg';

const Icon = () => <img src={pokeIcon} />;

export const Poke: Command = {
  command: 'poke',
  title: 'Poke',
  icon: <Icon />,
  description: 'poke an agent on your ship',
  arguments: ['app', 'mark', 'json'],
  schema: [
    (props: any[]) => ({
      app: props[0].innerHTML,
      mark: props[1].innerHTML,
      json: props[2].innerHTML,
    }),
  ],
};
