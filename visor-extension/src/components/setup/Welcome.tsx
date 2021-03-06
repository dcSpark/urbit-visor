import * as React from "react";
import logo from "../../icons/urbit.svg";
import { useHistory } from "react-router";
import { motion } from "framer-motion";
import "./setup.css";

export default function Welcome() {
  const history = useHistory();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="welcome padding flex-grow-wrapper"
    >
      <div className="flex-grow">
        <h1 className="title">Urbit Visor</h1>
        <h3 className="label">
          Setup Urbit Visor to transform your web browser into a first class
          Urbit client
        </h3>
        <img src={logo} className="App-logo" />
      </div>
      <button
        onClick={() => history.push("/setup")}
        className="single-button add-ship-button"
      >
        Setup
      </button>
    </motion.div>
  );
}
