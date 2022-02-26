import { Command } from '../types';

export const Subscribe: Command = {
  command: 'subscribe',
  title: 'Subscribe',
  description: 'subscribe to updates from an agent on your ship',
  arguments: ['app', 'path'],
  schema: [(props: any[]) => ({ app: props[0].innerHTML, path: props[1].innerHTML })],
};
