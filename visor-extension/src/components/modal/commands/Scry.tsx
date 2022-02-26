import { Command } from '../types';

export const Scry: Command = {
  command: 'scry',
  title: 'Scry',
  description: 'scry a noun from your ship',
  arguments: ['app', 'path'],
  schema: [(props: any[]) => ({ app: props[0].innerHTML, path: props[1].innerHTML })],
};
