import { Command } from '../types';

export const Poke: Command = {
  command: 'poke',
  title: 'Poke',
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
