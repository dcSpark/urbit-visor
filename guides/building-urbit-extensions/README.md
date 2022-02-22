# Building UV Extensions - Developer Guide

Previously [we made a guide ](https://github.com/dcspark/blabla) on how to make a Web Application which uses Urbit Visor to connect to a running Urbit Ship. We made a simple note-taking application called Urbit Notes, and as often happens with Urbit apps, it turned out to be quite useful.

This new guide will show how to make a browser extension which uses Urbit Visor to connect to a running Urbit Ship. Urbit Visor-based Browser Extensions enable a different sort of functionality compared to webapps, as they allow us to inject code into all websites we visit, and run background listeners in the browser to allow interaction from anywhere at any time.

In this guide for demonstration purposes we will be making a browser extension to enhance the functionality of Urbit Notes. The extension, that we'll call Urbit Notes Everywhere, will show a small popup window after clicking a keyboard shortcut, or clicking on the extension icon, through which we can add notes to our Urbit Notes app. And we will add an option to the right-click menu to send selected text to Urbit Notes.

Without further ado, let's get to it. The [previous guide](https://github.com/dcspark/blabla) already covered how to setup Urbit Visor so we will skip through that and go straight to developing the extension

## Making an Extension Manifest

To make a browser extension you first need to write a Manifest, which is a JSON file named `manifest.json`. Manifests can vary a bit between browsers. In our case we will be making a Chrome extension, and since 2022 all Chrome extensions must follow the [Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/) specification.

Let's make a new folder to house our code `mkdir urbit-notes-ext`.
Let's make two folders: `src` for the source code, and `dist` for the built code to be read by the browser.

```bash
cd urbit-notes-ext
mkdir src
mkdir dist
```

Let's make a manifest file and place it inside the `dist` subfolder.

A Manifest V3 `manifest.json` file looks like this:

```json
{
  "name": "Urbit Notes Everywhere",
  "version": "0.1.0",
  "description": "Browser Extension to take Urbit Notes everywhere on the Web",
  "manifest_version": 3,
  "icons": {
    "16": "./icons/icon16.png",
    "48": "./icons/icon48.png",
    "128": "./icons/icon128.png"
  },
  "content_scripts": [
    {
      "matches": ["*://*/*"],
      "js": ["content.js"]
    }
  ],
  "action": {
    "default_icons": {
      "16": "./icons/icon16.png",
      "48": "./icons/icon48.png",
      "128": "./icons/icon128.png"
    },
    "default_popup": "./popup.html",
    "default_title": "Urbit Notes Everywhere"
  },
  "host_permissions": ["*://*/*"],
  "web_accessible_resources": [
    {
      "resources": ["iframe.html"],
      "matches": ["<all_urls>"]
    }
  ]
}
```

A detailed explanation on Chrome extension manifest files is beyond the scope of this guide, for more details you can visit the [official documentation website](https://developer.chrome.com/docs/extensions/) by Google.

The code above will inject the javascript code in `content.js` on all websites that match the pattern `"*://*/*"`, i.e. every website. The extension icon will be taken from `./icons/`, which holds the same icon in three different sizes. And on clicking that action at the browser, it will open a popup displaying the contents of the file `./popup.html`.

We will be sandboxing our code inside an iframe, the source of which will be written on `iframe.html`, so we need to tell the manifest to expose that as `web_accessible_resources`.

So it follows that we need to start making three files, `content.js`, `iframe.html` and `popup.html`. Let's get to it.

## Getting Started

As in the case with Urbit Visor-powered webapps, Extensions using Urbit Visor will need to import the `uv-core` library, so we will also need a build tool for our JavaScript. Our frontend will be much simpler than Urbit Notes, however, so we won't be needing `create-react-app` and it's associated tooling. We will use `npm` to manage our single dependency, and `esbuild` to build our JavaScript.
Let's first initialize npm:

```bash
npm init
```

Then install esbuild:

```bash
npm i esbuild
```

`esbuild` has TypeScript support built in, and in dcSpark we are big fans of static typing, so we will be writing our code into two TypeScript files `src/content.ts` and `src/popup.ts` and then compiling them using `esbuild`.
There's different ways of using `esbuild` to build our code. As our extension is going to be quite simple we will add some simple `esbuild` CLI commands to the `scripts` key of our `package.json` file.

```json
  "scripts": {
    "build": "esbuild src/content.ts --outfile=dist/content.js && esbuild src/popup.ts --outfile=dist/popup.js --bundle",
  }
```

`npm run start` will give us hot reload for development, while `npm run build` will just build the file once.

Now let's install the Urbit Visor core library, the only dependency we are going to need.

```bash
`npm i @dcspark/uv-core`
```

Now let's test our setup. Let's make our TypeScript files.

```bash
touch src/content.ts
touch src/popup.ts
```

And our html files, the popup and iframe.

```bash
touch dist/popup.html
touch dist/iframe.html
```

Let's build our JavaScript once:

```bash
npm run build
```

And now let's install our extension inside the browser. Go to `chrome://extensions`, enable "Developer Mode", click on "Load unpacked", and then open the `dist` folder. Navigate any error message you find (don't forget to put those icons!) and eventually the extension should show up in the extension list. Once installed you'll see the icon in your browser extension toolbar. Click on it, and... nothing happens, of course. We still have to make the app. Let's get to it.

## Basic Concepts

As of the latest specification used by Chrome, browser extensions are made of a _content script_, a _service worker_ and a _popup page_. All of these are optional, your extension can have one, two or all of them, depending on how complex it will be.

The _popup page_ is the little UI that shows up when you click on the icon of a browser extension in your browser UI. That's actually just an HTML page, whose path we gave to the `manifest.json` file as `default_popup`.

The _content script_ is a JavaScript file which will be injected inside other websites open on our browser. You can put anything in a content script, from a couple lines of code to a full-fledged React application (as Twitter UV does). Depending on the complexity of your content script you will need to resort to different build tools for your JavaScript; that's all up to the developer, Chrome only requires that the end result is built into a single JavaScript file and it will inject that code.

The _service worker_ is a background process run by the browser, where you can add event listeners and then do IO operations such as persist data to disk (to the browser `localStorage`), do external requests or other computation.

Let's start building the popup page, which will enable users to write quick notes to their `Urbit Notes` notebook without having to visit the `Urbit Notes` website.

## Popup page

### HTML

As we mentioned, a browser extension popup page is just a simple HTML website. You can do anything with it, from a simple static page (as Twitter UV does) to a full React application (like Urbit Visor). Urbit Notes Everywhere will be something in between; it'll be a simple, single-view website with some vanilla JavaScript in it.

Let's make the HTML.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Urbit Visor Notes Everywhere</title>
  </head>
  <body>
    <div id="popup">
      <h3>Urbit Notes Everywhere</h3>
      <textarea></textarea>
      <button id="button">Save in Mars</button>
    </div>
    <script src="popup.js"></script>
  </body>
  <style>
    #popup {
      width: 400px;
      height: 300px;
    }
    h3 {
      text-align: center;
    }
    textarea {
      outline: none;
      background-color: white;
      border: 1px solid black;
      resize: none;
      width: 80%;
      height: 62%;
      display: block;
      margin: auto;
      padding: 1rem;
    }
    button {
      background-color: white;
      border: 1px solid black;
      height: 2rem;
      display: block;
      margin: 0.5rem auto;
      padding: 0.3rem;
    }
  </style>
</html>
```

As you see it's a rather simple website. There's one div, containing one header string, one textarea, and one button. There's also one `script` tag, sourcing the JavaScript inside `popup.js`. Paste the above code inside `dist/popup.html` and save the file. Navigate to `chrome://extensions`, and click on the refresh icon inside our extension. Now click on the extension icon and you should see our beautiful markup:
![screenshot of popup]()

Now, this does nothing yet, of course, because `popup.js` is empty. We need to make sure something happens when we click on the "Save in Mars" icon. Let's get to it.

### JavaScript

Open the `popup.ts` file and let's start making the logic for our extension. All we want to do is post notes to our Notebook, so in essence it's just the same we just did on the Urbit Notes webapp, but even simpler. We will be reusing much of that code.

First of all let's import Urbit Visor.

```ts
import { urbitVisor } from "@dcspark/uv-core";
```

And let's setup the Visor initialization logic. This app just needs to be able to post notes on `graph-store`; that means it must be able to `poke` the users Urbit server. `graph-store` nodes need the users ship name in order to poke, however, so we will need to fetch the user's `shipName` too. We also want to check if the Urbit Notes channel has been created already, and if not we'll want to offer the option to create one in the extension, so that's a `scry` and a `thread` we'll have to do. So let's ask for permissions for that upfront. We'll start slowly and first just save the ship name in our script.

```ts
let myShip = "";
function initiateVisor() {
  urbitVisor.require(["shipName", "scry", "poke", "thread"], setData);
}
function setData() {
  urbitVisor.getShip().then((res) => (myShip = res.response));
}
initiateVisor();
```

That should do it. You can now build the JavaScript:

```bash
npm run build
```

Reload the extension at `chrome://extensions`, and click on the popup. You should see a prompt for granting Permissions at your Visor.
![Permission prompt screenshot]()

You'll see something is a bit odd, though. Urbit Visor stores permissions by domain, so if you are using Urbit Dashboard you will see that your ship has given permissions to `https://urbitdashboard.com`.
Browser extensions however, don't have a domain name; they only have a base64 string UID. Which works well to identify extensions programatically, but we can't expect our users to remember that, e.g. Twitter UV Extension ID is `dfidmeghmgfhhflhfopoeinniomenjlf`. To improve the user experience, Urbit Visor lets developers `register` a name for your extension so your users know what they have given permission to.

So let's decline the permissions first, and go back to `popup.ts` to add that. Let's modify the `initiateVisor()` function:

```ts
function initiateVisor() {
  urbitVisor.registerName("Urbit Notes Everywhere");
  urbitVisor.require(["shipName", "scry", "poke", "thread"], setData);
}
```

Again build, reload, and click on the icon.
![Permission prompt screenshot with extension name]()

Much better.

Now let's add the rest of the logic. We'll copy the logic from the Urbit Notes webapp to build notebook posts from a string, slightly modified.

```ts
function makeIndex() {
  const DA_UNIX_EPOCH = BigInt("170141184475152167957503069145530368000");
  const DA_SECOND = BigInt("18446744073709551616");
  const timeSinceEpoch = (BigInt(Date.now()) * DA_SECOND) / BigInt(1000);
  return "/" + (DA_UNIX_EPOCH + timeSinceEpoch).toString();
}
function buildPost(index: string, contents = []) {
  return {
    author: "~" + myShip,
    contents: contents,
    hash: null,
    index: index,
    signatures: [],
    "time-sent": Date.now(),
  };
}
function addNotebookPost(title: string, text: string) {
  const index = makeIndex();
  const contents = [{ text: title }, { text: text }];
  const children = {
    "1": {
      post: buildPost(`${index}/1`),
      children: {
        "1": {
          children: null,
          post: buildPost(`${index}/1/1`, contents),
        },
      },
    },
    "2": {
      post: buildPost(`${index}/2`),
      children: null,
    },
  };
  const nodes = {};
  nodes[index] = {
    children: children,
    post: buildPost(index),
  };
  const body = {
    "add-nodes": {
      resource: { name: "my-urbit-notes", ship: `~${myShip}` },
      nodes: nodes,
    },
  };
  return body;
}
```

We are changing a bit here the logic for new posts. The Urbit Notes webapp generated indexes for new posts by incrementing the last existing index; doing the same here would add some needless overhead (we aren't listing existing posts anyway), so we will generate the indexes from scratch, using a function provided by the built-in Urbit Groups app, open sourced by the good people at Tlon.

Note that `graph-store` notebooks take both a title string and text body. To make our UI simpler (faster!) we decided to only have one single textarea as input. So we will need to extract the title from the text body. We'll make it so the first line (up to a reasonable length of 50 characters) gets extracted as the title, and the rest becomes the text. Let's make a function for that.

```ts
function extractText(): [string, string] {
  const text = (<HTMLInputElement>(
    document.querySelector("#urbit-visor-notes-everywhere-popup textarea")
  )).value;
  const title = text.split("\n")[0].substring(0, 50);
  const rest = text.replace(title, " ");
  return [title, rest];
}
```

We now have the logic set to build the necessary data structures to _poke_ the user's Urbit server. Now let's finally add the function so that a click on the button sends the data to the user's Urbit. We'll handle the response and display a confirmation message inside the button, because minimalism is what we do. At least when writing guides. If successfull, the popup will close automatically after a 2 second delay.

```ts
function saveNote() {
  const [title, text] = extractText();
  const body = buildNotebookPost(title, text);
  urbitVisor
    .poke({ app: "graph-store", mark: "graph-update-3", json: body })
    .then((res) => {
      button.disabled = true;
      if (res.status === "ok") (button.innerText = "OK"), close();
      else button.innerText = "Error";
    });
}
function close() {
  setTimeout(() => {
    window.close();
  }, 2000);
}
const button = document.querySelector("button");
button.addEventListener("click", saveNote);
```

And that's it, the logic is done. Build the app, reload the extension, and try it out by clicking on the extension icon. Voilà, our little extension is working.

### Content Script

Are we done? Well we could, if all that we're doing is a popup-based extension. But we have further ambitions with Urbit Notes Everywhere. Remember we also want to do it so that if you use a keyboard shortcut in any page that you're browsing, a small window will show up _inside the page_ and enable users to write a quick note to send to their Urbit server.

The injected window itself can share most (if not all) of the markup with our popup page, and all of the JavaScript logic. We just need to make a few styling adjustments, and add the injection logic in our *content script*.

Let's do that first. Let's go to `content.ts` and add the injection logic.

### Content Script Security

First one caveat before beginning. *Content Scripts* inject JavaScript code into any webpage. You can also use DOM APIs to inject DOM elements into any website. That's how Twitter UV injects urbit buttons into the Twitter.com markup, for example. There is only one problem with injecting JavaScript into websites from an extension *content script*.

All JavaScript in a content script is injected as is into the website you happen to be browsing in. That means that the host website has access to that code. All your functions, global variables, all those would be accessible to the JavaScript in that host website. Now, websites don't know which extension is going to inject any code into them, so it's not likely that they would try to access any of that code. However, there are bad people out there, people who actively try to exploit people's software and do bad things with it. And Urbit Visor would give any malicious actor direct access to your Urbit ship.

We obviously don't want that to happen. Urbit Visor extensions should follow the highest standards of security in order to protect their users. Thankfully browser extensions have a good way of isolating any code from the host websites they are injected to. We can use iframes.

An iframe is basically a sandboxed website injected as such into another website. If you have ever seen an embedded Twitter.com tweet or a YouTube video, those are displayed inside iframes. iframes don't have access to website that hosts them, and most importantly for us, the host website doesn't have access to the code in any iframe inside them.

So our content script will merely be injecting an iframe into all websites that we navigate to. Let's write that code:

```ts
function createFrame() {
  const el = document.createElement("iframe");
  el.id = "urbit-visor-notes-everywhere-popup";
  const url = chrome.runtime.getURL('iframe.html')
  el.src = url
  el.style.cssText = "height:100vh;width:100vw;position:fixed;top:0;left:0;"
  return el;
}
const frame = createFrame();
document.body.appendChild(frame);
```

This code will insert an iframe into every website we go to, and will style is according to that CSS string. The source of the iframe will be our `iframe.html` page, and we get the full URL using the `chrome.runtime.getURL()` function, so we don't need to deal with extension ids.

`iframe.html` is pretty much exactly the same as our `popup.html` page, including it's JavaScript code (which is what call Urbit Visor and enables the app's functionality). It just has some slightly different CSS so that it shows up centered inside the websites we want. It looks like this:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Urbit Visor Notes Everywhere</title>
  </head>
  <body>
    <div id="background">
      <div id="popup">
        <textarea></textarea>
        <button id="button">Save in Mars</button>
      </div>
    </div>
    <script src="popup.js"></script>
  </body>
  <style>
    #background {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      width: 100vw;
      background-color: rgb(0, 0, 0, 0.8);
      z-index: 45000;
    }
    #popup {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 50000;
      width: 400px;
      height: 300px;
    }
    textarea {
      outline: none;
      background-color: white;
      border: 1px solid black;
      resize: none;
      width: 100%;
      height: 80%;
      display: block;
      padding: 1rem;
    }
    button {
      background-color: white;
      border: 1px solid black;
      height: 2rem;
      display: block;
      margin: 0.5rem auto;
      padding: 0.3rem;
    }
  </style>
</html>
```

Build the app, reload the extension, and then go to any website. Say, `https://dcspark.io`. You will see the extension iframe show up almost immediately. And you can write notes with it! 
We don't want it to just show up upfront, however. We want to call it ourselves with a keyboard shortcut. Let's change `content.ts` to:
```ts
document.addEventListener("keydown", (e: KeyboardEvent)=> {
  if (e.altKey && e.code === "Comma")
  toggleFrame();
  if (e.code === "Escape")
  removeFrame();
});
function createFrame(){
  const el = document.createElement("iframe");
  el.id = "urbit-visor-notes-everywhere-popup"
  const url = chrome.runtime.getURL('iframe.html')
  el.src = url
  el.style.cssText = "height:100vh;width:100vw;position:fixed;top:0;left:0;"
  return el
}
function toggleFrame(){
  const popup = createFrame();
  const existingPopup = document.getElementById("urbit-visor-notes-everywhere-popup");
  if (!existingPopup) document.body.appendChild(popup);
  else document.body.removeChild(existingPopup)
}
function removeFrame(){
  const existingPopup = document.getElementById("urbit-visor-notes-everywhere-popup");
  if (existingPopup) document.body.removeChild(existingPopup)
}
```
This will make it so that on clicking `ALT+,` (comma), the Urbit Notes Everywhere window shows up, or disappears. Build the app, reload the extension, and try it again on some random website.

### Finishing touches

The extension now works fine. There's one little caveat though; the notes window doesn't disappear after sending a note, as the popup (the one that appears on clicking the extension icon) did. That's because the `content script` injects the iframe into the website, but iframes are sandboxed from their environment, so there's no way to communicate with them directly. We need to call the `togglePopup()` function in `content.ts` from the iframe JavaScript file, `popup.ts`. Fortunately there's a work around.

We can use the `window.postMessage` API to have the iframe send a message, and have the content script read it. Let's modify `popup.ts` first:
```ts
function close() {
  setTimeout(() => {
    window.parent.postMessage("close_iframe", "*");
    window.close();
  }, 2000);
}
```

And then set a listener for window messages on `content.ts` to handle that message.
```ts
window.addEventListener("message", (m)=>{
  if (m.data === "close_iframe")
  toggleFrame()
  else if (m.data === "remove_iframe")
  removeFrame()
})
```

iframes being sandboxed also means that the content script will stop receiving events once we put focus on the iframe. So our nifty keyboard shortcut will stop working once we click on the iframe. That obviously breaks the desired functionality of our shortcut, so we'll need to add another keyboard event handler at the iframe itself so that the iframe is closed when we use the shortcut or press Escape.

```ts
document.addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.altKey && e.code === "Comma")
    window.parent.postMessage("close_iframe", "*");
  if (e.code === "Escape") window.parent.postMessage("remove_iframe", "*");
});
```

That should do it. Our extension is done.

### Adding Guarantees

Well, it's done but we don't have any error handling. What if a user doesn't have a Urbit Notes channel created yet? We should want to account for that. Let's add some handling for that case. As it often happens handling edge cases results in as much if not more code than the core functionality of the app, but such is the world of user interfaces.

First we'll need to scry graph-store to see if the user has a Urbit Notes notebook among his `keys`.
```ts
interface Key {
  name: string; // the name of the channel, in kebab-case.
  ship: string; // the ship that hosts the channel
}
function checkChannelExists(ship: string) {
  urbitVisor.scry({ app: "graph-store", path: "/keys" }).then((res) => {
    if (res.status === "ok") {
      const keys: Key[] = res.response["graph-update"].keys;
      const haveKey = !!keys.find(
        (key: Key) => key.ship === ship && key.name === "my-urbit-notes"
      );
      if (haveKey) allow();
      else disallow();
    } else error();
  });
}
```

We want to stay minimalistic, so our error messages are going to be injected directly inside our tiny iframe, with no added markup. We'll just inject some text into the textarea, and add a hidden button that only shows up when the required channel does not exist, so users can create the channel when they click on it.
So let's modify our markup first. This will be our popup:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Urbit Visor Notes Everywhere</title>
  </head>
  <body>
    <div id="popup">
      <h3>Urbit Notes Everywhere</h3>
      <textarea id="textarea"></textarea>
      <button id="button">Save in Mars</button>
      <button id="create-button">Create Channel</button>
    </div>
    <script src="popup.js"></script>
  </body>
  <style>
    #popup {
      width: 400px;
      height: 300px;
    }
    h3 {
      text-align: center;
    }
    textarea {
      outline: none;
      background-color: white;
      border: 1px solid black;
      resize: none;
      width: 80%;
      height: 62%;
      display: block;
      margin: auto;
      padding: 1rem;
    }
    button {
      background-color: white;
      border: 1px solid black;
      height: 2rem;
      display: block;
      margin: 0.5rem auto;
      padding: 0.3rem;
    }
    #create-button {
      display: none;
    }
  </style>
</html>
```
And this our iframe:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Urbit Visor Notes Everywhere</title>
  </head>
  <body>
    <div id="background">
      <div id="popup">
        <textarea id="textarea"></textarea>
        <button id="button">Save in Mars</button>
        <button id="create-button">Create Channel</button>
      </div>
    </div>
    <script src="popup.js"></script>
  </body>
  <style>
    * {
      box-sizing: border-box;
    }
    #background {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      width: 100vw;
      background-color: rgb(0, 0, 0, 0.8);
      z-index: 2147483645;
      display: none;
    }
    #welcome {
      position: fixed;
      background-color: white;
      color: black;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 2147483646;
      width: 400px;
      height: 300px;
      display: none;
    }
    #popup {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 2147483646;
      width: 400px;
      height: 300px;
    }
    textarea {
      outline: none;
      background-color: white;
      border: 1px solid black;
      resize: none;
      width: 100%;
      height: 80%;
      display: block;
      padding: 1rem;
    }
    button {
      background-color: white;
      border: 1px solid black;
      height: 2rem;
      display: block;
      margin: 0.5rem auto;
      padding: 0.3rem;
    }
    #create-button {
      display: none;
    }
  </style>
</html>

```

Then create variables to modify our different HTML elements.
```ts
const iframe = document.getElementById("background");
const textarea = <HTMLTextAreaElement>document.getElementById("textarea");
const button = <HTMLButtonElement>document.getElementById("button");
const createButton = <HTMLButtonElement>(
  document.getElementById("create-button")
);
button.addEventListener("click", saveNote);
createButton.addEventListener("click", createChannel);
```
`createChannel()` we will copy from the Urbit Notes webapp.
```ts
async function createChannel() {
  const body = {
    create: {
      resource: {
        ship: `~${myShip}`,
        name: "my-urbit-notes",
      },
      title: "My Urbit Notes",
      description: "My Awesome Private Urbit Notebook",
      associated: {
        policy: {
          invite: { pending: [] },
        },
      },
      module: "publish",
      mark: "graph-validator-publish",
    },
  };
  urbitVisor
    .thread({
      threadName: "graph-create",
      inputMark: "landscape/graph-view-action",
      outputMark: "json",
      body: body,
    })
    .then((res) => {
      if (res.status === "ok") checkChannelExists(myShip);
    });
}
```
Now let's create some the functions that will be called by `checkChannelExists()` depending on the result.
```ts
function allow(){
  textarea.value = "";
  createButton.style.display = "none";
  button.style.display = "block";
}
function disallow() {
  textarea.value = `
  Welcome to Urbit Notes Everywhere
  It appears you don't have an Urbit Notes Notebook yet
  Click the button below to create it
  `;
  button.style.display = "none";
  createButton.style.display = "block";
}
function error() {
  button.innerText = "Error";
  button.disabled = true;
}
```

And now let's modify our `setData()` function so that all this logic runs as soon as the app starts.
```ts
function setData() {
  urbitVisor.getShip().then((res) => {
    console.log(res.response, "r");
    myShip = res.response;
    if (iframe) iframe.style.display = "block";
    checkChannelExists(res.response);
  });
}
```
## Conclusion 

And that's it! Our nifty little Urbit Notes helper UV extension is complete. We can now build your app and submit it to the Chrome Webstore or however you want to publish it. This was a very simple demonstration, but it's still quite powerful. In just a few hours we made a helper for Urbit Notes, where on pressing a keyboard shortcut, a small window with a textarea and a button appears on the screen. We can then type text into that textarea, and after pressing the button that note will be sent to our Urbit Notes. Simple, fast and easy, as all Notes app should be.

This simple app shows the vast potential of building Urbit-based applications with Urbit Visor so you can interact with your personal server wherever you are. You are welcome to use it any time, or modify it to your liking. Hope you enjoyed this guide too and we hope to see you make new extensions to enrich the Urbit Visor ecosystem.