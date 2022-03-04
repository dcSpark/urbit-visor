import React from 'react';
import * as CSS from 'csstype';
import { useEffect, useState } from 'react';
import { Command } from './types';

interface MenuOptionProps {
  handleSelection: (command: Command) => void;
  keyDown: React.KeyboardEvent;
  selected: Command;
  commands: Command[];
}

const MenuOptions = (props: MenuOptionProps) => {
  const [clickedIndex, setClickedIndex] = useState(-1);

  useEffect(() => {
    if (!props.keyDown) {
      return;
    } else if (props.keyDown.key === 'ArrowDown' && clickedIndex < props.commands.length - 1) {
      setClickedIndex(clickedIndex + 1);
      props.handleSelection(props.commands[clickedIndex + 1]);
    } else {
      return;
    }
  }, [props.keyDown]);
  useEffect(() => {
    if (!props.keyDown) {
      return;
    } else if (props.keyDown.key === 'ArrowUp' && clickedIndex > 0) {
      setClickedIndex(clickedIndex - 1);
      props.handleSelection(props.commands[clickedIndex - 1]);
    } else {
      return;
    }
  }, [props.keyDown]);

  const Icon = props.selected?.icon;

  return (
    <div className="command-launcher-menu-list">
      {props.commands.map((option, index) => (
        <div
          className={
            !props.selected
              ? 'menu-option'
              : index == clickedIndex
              ? 'menu-option selected'
              : 'menu-option'
          }
          key={index}
        >
          <div className="command-icon">{option.icon}</div>
          {option.title}
        </div>
      ))}
    </div>
  );
};

export default MenuOptions;
