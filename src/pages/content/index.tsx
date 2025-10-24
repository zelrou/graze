import { createRoot } from 'react-dom/client';
import './style.css'
import App from './App.tsx'

const div = document.createElement('div');
div.id = '__root';
document.body.appendChild(div);

const rootContainer = document.querySelector('#__root');
if (!rootContainer) throw new Error("Can't find Content root element");
const root = createRoot(rootContainer);
root.render( <div id="root"></div>);

try {
  console.log('content script loaded');
} catch (e) {
  console.error(e);
}


/*
Define a function in the content script's scope, then export it
into the page script's scope.
https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Sharing_objects_with_page_scripts

function getTabText(url) {
    if (url === window.location) {
        const _paragraphs = Array.from(document.getElementsByTagName('p'))
            .map((el)=>{ return el.innerText });
        browser.runtime.sendMessage({ _paragraphs });
    } else {
        console.log('nope')
    }
}
exportFunction(()=>getTabText, window, { defineAs: "getTabText" });
*/

let _paragraphs = Array.from(document.getElementsByTagName('p')).map((el)=>{
    return el.innerText
});


browser.runtime.onMessage.addListener((request) => {
  console.log("Message from the background script:");
  console.log(request.greeting);
  return Promise.resolve({ response: "Hi from content script", _paragraphs});
});



