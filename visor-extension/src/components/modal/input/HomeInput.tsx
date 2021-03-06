import React from 'react';
import * as CSS from 'csstype';
import { useEffect, useState, useRef } from 'react';
import { Messaging } from '../../../messaging';
import Urbit from '@urbit/http-api';
import Input from '../Input';
import BaseInput from '../BaseInput';

import { Command, MenuItem } from '../types';

interface InputProps {
  nextArg: Boolean;
  previousArg: Boolean;
  sendCommand: Boolean;
  airlockResponse: (response: any) => void;
  clearSelected: (clear: Boolean) => void;
  selectedToInput: Command;
  selected: MenuItem;
  landscapeFork: string;
}

const HomeInput = (props: InputProps) => {
  const [url, setUrl] = useState(null);
  const [focus, setFocus] = useState(null);

  useEffect(() => {
    Messaging.sendToBackground({ action: 'get_ships' }).then(res => {
      setUrl(res.airlock.url);
    });
  }, [props.selectedToInput]);

  useEffect(() => {
    if (url) {
      const data = {
        url: props.landscapeFork == 'escape' ? `${url}` : `${url}`,
      };
      Messaging.relayToBackground({ app: 'command-launcher', action: 'route', data: data });
      props.clearSelected(true);
    }
  }, [url]);

  return <BaseInput {...props} />;
};

export default HomeInput;
