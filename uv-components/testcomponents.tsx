import * as React from "react";
import * as ReactDOMServer from 'react-dom/server';



const element = <div className="testDiv">test</div>
const testFunction = () => console.log("lol")
const element2 = 
<div className="dynamicDiv">
    <button onClick={testFunction}>
        button
    </button>
</div>

export const staticComponent = ReactDOMServer.renderToString(element);
export const dynamicComponent = ReactDOMServer.renderToString(element2);
