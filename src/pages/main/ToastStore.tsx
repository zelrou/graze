import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

let nextId = 0;
let toasts = []
let listeners = [];

const emitChangeToast = (d) => {
    for (let listener of listeners){
        listener(d);
    }
}

function moveToastsUp() {
  const toasts = document.querySelectorAll(".toast");

  toasts.forEach((toast) => {
    // If the toast is the one that has just appeared, we don't want it to move up.
    if (toast.classList.contains("newest")) {
      toast.style.bottom = `30px`;
      toast.classList.remove("newest");
    } else {
      // Move up all the other toasts by 50px to make way for the new one
      const prevValue = toast.style.bottom.replace("px", "");
      const newValue = parseInt(prevValue) + 50;
      toast.style.bottom = `${newValue}px`;
    }
  });
}

const devListener=(d)=>{
    //console.log('devListener d t l', d, toasts, listeners)
    moveToastsUp()
}
listeners.push(devListener)

export const toastStore = {
    addToast(msg){
        const toastContainer = document.body
        const toast = document.createElement("div");
        toasts.push(toast)
        toast.popover = "manual";
        toast.classList.add("toast", "newest", "bg-zinc-700", "border", "border-2", "border-zinc-500", "text-zinc-300", "mr-5", "rounded-sm", "py-1", "px-3");
        toast.textContent = msg
        setTimeout(() => {
            toast.hidePopover();
            toast.remove();
            toasts.shift();
        }, 4000);
        toastContainer.appendChild(toast)
        toast.showPopover();
        emitChangeToast({type: 'new_toast'})
    },
    subscribe(cb){
        listeners.push(cb)
        for (let [toast,i] of toasts) {
            for (let [f, j] of listeners) {
                toast.addEventListener("toggle", f)
                toast.addEventListener("close", f)
            }
        }
        return () => {
            for (let [toast,i] of toasts) {
                for (let [f, j] of listeners) {
                    toast.removeEventListener("toggle", f)
                    toast.removeEventListener("close", f)
                }
            }
        }
    },
    getSnapshot(){
        return toasts;
    }
}

export const ToastContainer = ({msg}) => {
    //const toastContainerRef = useRef(null)
    const toasts = useSyncExternalStore(toastStore.subscribe, toastStore.getSnapshot)
    useEffect(()=>{
        console.log('toastContainer Effect, t, m')//, toasts, msg)
        msg.text && toastStore.addToast(msg.text)
    },[msg, toasts])
    console.log('toastContainer', toasts);
    return <div id='toastContainer' className='hidden'></div>
    /*
    return createPortal(
        (<div ref={toastContainerRef} className='border flex flex-col relative'></div>),
        document.body)
    */
}
