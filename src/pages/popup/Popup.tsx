import React from 'react';
import logo from '@assets/img/logo.svg';

/*
let createData = {
//  type: "detached_panel",
  url: "src/pages/content/main/index.html",
  width: 250,
  height: 100,
};
//let creating = browser.tabs.create(createData);
*/


export default function Popup() {
    const url = '/src/pages/main/index.html'
    return (
        <div className={`absolute top-0 left-0 right-0 bottom-0 text-center
            h-full p-3 bg-zinc-800 grid`}>
            <header className={`place-self-center flex flex-col gap-y-3
                items-center justify-center text-white`}>
                <img className="h-32 pointer-events-none" alt="logo"
                    src={logo} />
                <button
                    className='border py-3 px-1 bg-zinc-600 hover:bg-yellow-300/50'
                    onClick={() => { return browser.tabs.create({url}) }}>
                    Open Graze</button>
            </header>
        </div>);
}

