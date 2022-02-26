import React from 'react';
import * as CSS from 'csstype';
import { useEffect, useState, useRef } from 'react';
import Urbit from '@urbit/http-api';
import PokeInput from './input/PokeInput';
import ScryInput from './input/ScryInput';
import SubscribeInput from './input/SubscribeInput';
import SpiderInput from './input/SpiderInput';
import TerminalInput from './input/TerminalInput';
import DMInput from './input/DMInput';
import NotificationInput from './input/NotificationInput';
import BaseInput from './BaseInput';
import visorSvgLogo from '../../icons/visorWhiteText.svg';

import { Command } from './types';
import Input from './Input';

interface InputProps {
  selected: Command;
  baseFocus: Boolean;
  nextArg: Boolean;
  previousArg: Boolean;
  sendCommand: Boolean;
  airlockResponse: (response: any) => void;
  clearSelected: (clear: Boolean) => void;
}

const Inputbox = (props: InputProps) => {
  let command;

  switch (props.selected?.title) {
    case 'Poke':
      command = <PokeInput {...props} />;
      break;
    case 'Scry':
      command = <ScryInput {...props} />;
      break;
    case 'Subscribe':
      command = <SubscribeInput {...props} />;
      break;
    case 'Thread':
      command = <SpiderInput {...props} />;
      break;
    case 'Terminal':
      command = <TerminalInput {...props} />;
      break;
    case 'DM':
      command = <DMInput {...props} />;
      break;
    case 'Notifications':
      command = <NotificationInput {...props} />;
      break;
    default:
      command = <BaseInput {...props} />;
  }

  return (
    <div className="modal-input-box">
      <div className="logo-container">
        <div className="logo">
          <img src={visorSvgLogo} />
        </div>
      </div>
      {command}
    </div>
  );
};

export default Inputbox;
