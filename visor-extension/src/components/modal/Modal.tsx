import React from 'react';
import * as CSS from 'csstype';
import { useEffect, useLayoutEffect, useState, useRef, useCallback } from 'react';
import { urbitVisor } from '@dcspark/uv-core';
import Urbit from '@urbit/http-api';
import { Messaging } from '../../messaging';
import { VisorSubscription } from '../../types';
import Inputbox from './Inputbox';
import Body from './Body';
import { Poke } from './commands/Poke';
import { Scry } from './commands/Scry';
import { Subscribe } from './commands/Subscribe';
import { Spider } from './commands/Spider';
import { Terminal } from './commands/Terminal';
import { DM } from './commands/DM';
import { Notifications } from './commands/Notifications';
import { Command } from './types';

const commands: Command[] = [DM, Terminal, Poke, Scry, Spider, Subscribe, Notifications];

const Modal = () => {
  const rootRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [baseFocus, setBaseFocus] = useState(null);
  const [dims, setDims] = useState(null);
  const [selectedToInput, setSelectedToInput] = useState(null);
  const [keyDown, setKeyDown] = useState(null);
  const [nextArg, setNextArg] = useState(null);
  const [previousArg, setPreviousArg] = useState(null);
  const [sendCommand, setSendCommand] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [airlockResponse, setAirlockResponse] = useState(null);
  const [clearSelected, setClearSelected] = useState(null);
  const [spaceAllowed, setSpaceAllowed] = useState(null);

  useEffect(() => {
    setNextArg(null);
    setPreviousArg(null);
    setSendCommand(null);
    setBaseFocus(false);
    setClearSelected(null);
  }, [nextArg, previousArg, sendCommand, baseFocus, clearSelected]);
  useEffect(() => {
    if (clearSelected) {
      setSelectedToInput(null);
      setSelected('');
      setBaseFocus(true);
    }
  }, [clearSelected]);

  const handleMessage = (e: any) => {
    if (e.data == 'focus') {
      console.log('focusing');
      if (selectedToInput) {
        rootRef.current.focus();
      } else setBaseFocus(true);
    } else if (e.data == 'closing') {
      setSelectedToInput(null);
      setSelected(null);
    } else return;
  };

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  });

  /*
  useEffect(() => {
    const sub = urbitVisor.on("connected", [], () => {
      handleConnection()
    });
    handleConnection();
    return () => urbitVisor.off(sub)
  })

  const handleConnection = () => {
    if (isConnected) {
      return
    }
    else {
      urbitVisor.isConnected().then(connected => {
        if (connected.response) {
          setIsConnected(true);
        }
        else {
          urbitVisor.promptConnection();
        }
      });
    }
  }
*/

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key == 'Enter' && selectedToInput !== selected) {
      event.preventDefault();
      setSelectedToInput(selected);
      setAirlockResponse(null);
    } else if (event.key == 'Enter' && selected == selectedToInput) {
      event.preventDefault();
      setSendCommand(true);
      setSpaceAllowed(false);
    } else if (event.shiftKey && event.key == 'Tab' && selected == selectedToInput) {
      setPreviousArg(true);
    } else if (event.key == 'Tab' && selected == selectedToInput) {
      setNextArg(true);
    } else if (event.key == 'Escape') {
      console.log('sending close');
      event.preventDefault();
      window.top.postMessage('close', '*');
      setSelectedToInput(null);
      setSelected(null);
    } else if (event.key == 'ArrowUp' || event.key == 'ArrowDown') {
      event.preventDefault();
      setKeyDown(event);
      return;
    } else {
      return;
    }
  };
  return (
    <div
      ref={rootRef}
      className="modal-container"
      id={'modalContainer'}
      onKeyDown={(event: React.KeyboardEvent) => handleKeyDown(event)}
      tabIndex={-1}
    >
      <Inputbox
        baseFocus={baseFocus}
        selected={selectedToInput}
        clearSelected={(clear: Boolean) => setClearSelected(clear)}
        nextArg={nextArg}
        previousArg={previousArg}
        sendCommand={sendCommand}
        airlockResponse={(res: any) => setAirlockResponse(res)}
      />
      <Body
        commands={commands}
        handleSelection={(i: Command) => setSelected(i)}
        selected={selected}
        keyDown={keyDown}
        airlockResponse={airlockResponse}
      />
    </div>
  );
};

export default Modal;
