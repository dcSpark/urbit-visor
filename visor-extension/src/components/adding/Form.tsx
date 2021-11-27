import * as React from "react";
import { useState } from "react";
import Spinner from "../ui/svg/Spinner";
import { fetchShipname, scrapeShipname } from "../../urbit";
import { Messaging } from "@dcspark/uv-core";
import "./adding.css";
import { motion } from "framer-motion";
import icon from "../../icons/plus-icon.svg";

interface AddShipFormProps {
  url: string;
  code: string;
  setUrl: (v: string) => void;
  setCode: (v: string) => void;
  setShipName: (shipName: string) => void;
}

export default function AddShipForm({
  url,
  code,
  setUrl,
  setCode,
  setShipName,
}: AddShipFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function postLogin(url: string, code: string): Promise<void> {
    const controller = new AbortController();
    setTimeout(() => {
      controller.abort();
    }, 5000);
    fetch(url.replace(/\/$/g, "") + "/~/login", {
      body: `password=${code}`,
      method: "POST",
      credentials: "include",
      redirect: "follow",
      signal: controller.signal,
    })
      .then(async (res) => {
        switch (res.status) {
          case 204:
            Messaging.sendToBackground({
              action: "cache_form_url",
              data: { url: "" },
            });
            setLoading(false);
            scrapeShipname(url)
              .then((shipName) => setShipName(shipName))
              .catch((err) => setError("Your ship needs an OS update"));
            break;
          case 400:
            setError("Invalid +code.\nCould not connect to ship.");
            setLoading(false);
            break;
          default:
            setError("Invalid URL.\nCould not connect to ship.");
            setLoading(false);
            break;
        }
      })
      .catch((err) => {
        console.log(err, "err");
        setError("Could not connect");
        setLoading(false);
      });
  }

  const spinner = (
    <Spinner width="24" height="24" innerColor="white" outerColor="black" />
  );

  const onChangeURL = (e: React.FormEvent<HTMLInputElement>) => {
    setUrl(e.currentTarget.value);
    Messaging.sendToBackground({
      action: "cache_form_url",
      data: { url: e.currentTarget.value },
    });
  };
  const onChangeCode = (e: React.FormEvent<HTMLInputElement>) =>
    setCode(e.currentTarget.value);
  const onSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setError("");
    setLoading(true);
    postLogin(url, code);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="padding flex-grow-wrapper"
    >
      <div>
        <div className="container-progress">
          <div className="progress-bar" style={{ width: "66%" }} />
          <span className="progress-step">Step 2/3</span>
        </div>
        <img src={icon} className="icon" />
        <h2 className="mid-title">Input Your Urbit Ship Credentials</h2>
      </div>
      <form className="form" onSubmit={onSubmit}>
        <div className="inputs flex-grow">
          <label className="label-input" htmlFor="shipURL">
            URL
          </label>
          <input
            type="text"
            name="shipURL"
            id="loginFormShipURL"
            value={url}
            placeholder="http://localhost"
            onChange={onChangeURL}
            required
          />
          <label className="label-input" htmlFor="shipCode">
            +code ({code.length}/27)
          </label>
          <input
            type="password"
            name="shipCode"
            id="loginFormShipCode"
            value={code}
            placeholder="sampel-sampel-sampel-sampel"
            onChange={onChangeCode}
            maxLength={27}
            required
          />
        </div>
        <div className="errorMessage">
          {loading && <div className="spinner">{spinner}</div>}
          {error.split("\n").map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <button
          disabled={code.length < 27}
          className="single-button"
          type="submit"
        >
          + Add Ship
        </button>
      </form>
    </motion.div>
  );
}
