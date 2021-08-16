import React, { useState, useRef } from "react";
import { useOnClickOutside } from '../../hooks/hooks';
import "./navbar.css";
import Sigil from "./svg/Sigil"
import logo from "../../urbit.svg";
import { Link, useHistory } from "react-router-dom";
import { EncryptedShipCredentials } from "../../types/types";
import { processName } from "../../utils"



interface NavBarProps {
  ships: EncryptedShipCredentials[],
  selected: EncryptedShipCredentials,
  switchShip: (s: EncryptedShipCredentials) => void;
}

export default function NavBar(props: NavBarProps) {
  const sigilbutton = useRef(null);
  const [modalOpen, toggleModal] = useState(false);
  const dummystyle = {width: "50px"}
  const dummy = <div className="dummySigil" style={dummystyle} />
  const sigil =
    <div ref={sigilbutton} onClick={() => toggleModal(!modalOpen)} className="navbar-sigil">
      <Sigil size={50} patp={props.selected?.shipName} />
    </div>
  const active = props.selected ? sigil : dummy
  return (<nav className="App-navbar">
    <img src={logo} className="Nav-logo" />
    <Link to="/">
      <h4>Login With Urbit</h4>
    </Link>
    {active}
    {modalOpen &&
      <Modal
        parent={sigilbutton}
        hide={() => toggleModal(!modalOpen)}
        select={(s: EncryptedShipCredentials) => props.switchShip(s)}
        {...props}
      />
    }
  </nav>);
}

interface ModalProps extends NavBarProps {
  parent: any,
  hide: () => void,
  select: (s: EncryptedShipCredentials) => void
}

function Modal(props: ModalProps) {
  const history = useHistory();
  const ref = useRef(null);
  const refs = [ref, props.parent];
  const handleClickOutside = () => props.hide();
  function select(ship: EncryptedShipCredentials) {
    props.hide();
    props.switchShip(ship)
  };
  function addMore() {
    props.hide();
    history.push("/add_ship");
  }
  useOnClickOutside(refs, handleClickOutside);
  return (
    <div ref={ref} className="ship-switcher-modal">
      <div>My ships</div>
      <hr />
      {props.ships.map((ship: EncryptedShipCredentials) => {
        return <div key={ship.shipName} onClick={() => select(ship)} className="ship-in-modal">{processName(ship.shipName)}</div>
      })}
      <div onClick={addMore} className="add-more-link">+ Add more</div>
    </div>
  )
}