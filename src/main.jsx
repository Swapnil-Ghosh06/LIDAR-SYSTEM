import React from 'react';
import ReactDOM from 'react-dom/client';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import App from './App';
import useSimStore from './store/useSimStore';
import './index.css';

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

// Expose store for console testing
window.__store = useSimStore;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
