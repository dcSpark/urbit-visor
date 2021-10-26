import React from 'react';
import ReactDOM from "react-dom";
import { useState, useEffect, useRef } from "react";
import {urbitVisor} from "@dcspark/uv-core";

interface UrbitKey {
  ship: string,
  name: string
}
interface UrbitChannel{
  title: string,
  type: "post" | "chat" | "link" | "publish" | null,
  group: string,
  ship: string,
  name: string
}
const bg = "rgb(25,35,31)"
const lightbg = "rgb(35,45,41)"
const borderColor = "rgb(40,51,45)"


function referenceMetadata(channel: any, metadata: any): UrbitChannel{
  const url: string | undefined = Object.keys(metadata).find(el => el.includes(`${channel.ship}/${channel.name}`));
 
  if (url){
   const title =  metadata[url].metadata.title;
   const type = metadata[url].metadata.config.graph;
   const group = metadata[url].group;
   const groupMetadata = metadata[`${group}/groups${group}`];
   console.log(groupMetadata, "group")
   const groupTitle = groupMetadata?.metadata?.title;
   return {
     title: title,
     type: type, 
     group: groupTitle || channel.name,
     ship: channel.ship,
     name: channel.name
   }
  }
  else return {title: "", group: "", type: null, ship: channel.ship, name: channel.name}
}

export function ReactChannels() {
  const overlayStyles = {
    position: "fixed" as any,
    top: 0,
    paddingTop: "2rem",
    backgroundColor: "rgb(25, 25, 25, 0.92)",
    width: "100vw",
    height: "100vh",
    zIndex: 60000
  }
  console.log('channel selector loaded')
  return(
    <div style={overlayStyles} className="overlay">
      <ChannelSelectBox />
    </div>
  )
}

function ChannelSelectBox(){

  async function scry(){
    const keys = await urbitVisor.scry({app: "graph-store", path: "/keys"});
    console.log(keys, "component requesting keys")
  }
  const [channels, setChannels] = useState<UrbitChannel[]>([]);
  useEffect(()=>{
    scry();
    readMetadata();
  },[]);

  async function readMetadata(){
    console.log("oh hai")
    setLoading(true)
   const subscription = urbitVisor.on("sse", ["metadata-update", "associations"], async (data: any) => {
      console.log(data, "metadata received")
      setMetadata(data);
      const keys = await urbitVisor.scry({app: "graph-store", path: "/keys"});
      setLoading(false)
      console.log(keys.response["graph-update"].keys, "keys")
      const list =  keys.response["graph-update"].keys.map((channel: any) => referenceMetadata(channel, data))
      setChannels(list);
      setLoading(false);
    });
    urbitVisor.subscribe({app: "metadata-store", path: "/all"}).then(res => console.log(res, "res"))

  }
  const [keys, setKeys] = useState<UrbitKey[]>([]);
  const [selected, setSelected] = useState<UrbitKey[]>([]);
  const [metadata, setMetadata] = useState({})
  const [loading, setLoading] = useState(false);

  const divStyles = {
    width: "80%",
    margin: "1rem auto",
    borderRadius: "1rem",
    padding: "1rem",
    backgroundColor: bg,
    height: "600px",
    overflow: "auto",
    color: "white"
  }
  const logoStyles = {
    width: "100px"
  }
  const titleStyles = {
    margin: "auto",
    textAlign: "center" as "center",
  }
  function addToSelection(channel: UrbitChannel) {
    if (selected.find(ek => ek.ship === channel.ship && ek.name === channel.name))
      setSelected(selected.filter(ek => ek.ship !== channel.ship || ek.name !== channel.name))
    else
      setSelected([...selected, channel])
  }

  const containerStyles = {
    display: "flex",
    maxWidth: "100%",
    flexWrap: "wrap" as any
  }



  return (
    <div style={divStyles} className="uv-channel-selector">
      <div style={titleStyles} className="title">
        <img style={logoStyles} src="https://github.com/dcSpark/urbit-visor/raw/main/assets/visor-logo.png" alt="" />
        <p>Channel Selector</p>
      </div>
      {loading && <p>... loading ...</p>}
      <div style={containerStyles} className="key-container">
      {channels.map((k, index) => {
        return (
        <Key key={index} add={addToSelection} channel={k} />
        )
      })}
      </div>
    </div>);

}
interface Keyprops {
  channel: UrbitChannel
  add: (key: UrbitChannel) => void,
}
function Key(props: Keyprops) {
  const [string, setString] = useState("");
  const [bold, setBold] = useState(false);
  console.log(bold, "bold")

  const styles = {
    backgroundColor: lightbg,
    border: bold ? "1px solid white" : "none",
    borderRadius: "1rem",
    padding: "0.5rem",
    color: "white",
    marginRight: "5px",
    width: "47.5%",
    cursor: "pointer"
  }
  const className = bold ? "bold" : ""
  function select() {
    setBold(!bold);
    props.add(props.channel)
  }
  return (
    <p style={styles} onClick={select} className={className} > {props.channel.group} - {props.channel.title} </p>
  )
}

// React.createElement(ReactChannels);

// {/* export default function RenderComponent(element, name) {
//     ReactDOM.render(<MyComponent name={name}>, element);
//   } */}

export function Channels(element) {
    ReactDOM.render(<ReactChannels/>, element);
}



// it maybe the case that thus rendered components just won't update by something
// as weird as pubsub urbit events