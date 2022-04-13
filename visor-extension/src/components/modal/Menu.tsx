import React from 'react';
import * as CSS from 'csstype';
import { useEffect, useState } from 'react';
import MenuOptions from './MenuOptions';
import { MenuItem, ContextMenuItem, Command } from './types';

interface MenuOptionProps {
  handleSelection: (command: MenuItem) => void;
  keyDown: React.KeyboardEvent;
  selected: MenuItem;
  firstSelected: Boolean;
  commands: Command[];
  contextItems?: ContextMenuItem[];
  handleSelectCurrentItem: (menuItem: MenuItem) => void;
}

const Menu = (props: MenuOptionProps) => {
  return (
    <div className="command-launcher-menu">
      <MenuOptions
        commands={props.commands}
        contextItems={props.contextItems}
        selected={props.selected}
        handleSelection={props.handleSelection}
        keyDown={props.keyDown}
        firstSelected={props.firstSelected}
        handleSelectCurrentItem={props.handleSelectCurrentItem}
      />
    </div>
  );
};

export default Menu;
