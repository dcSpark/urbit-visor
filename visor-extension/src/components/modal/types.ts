import React from 'react';

export interface Command {
  command?: String;
  icon?: React.ReactNode;
  title: String;
  description: String;
  arguments?: string[];
  schema?: ((props: any[]) => {})[];
  routingTarget?: string;
  routingFill?: string;
}
