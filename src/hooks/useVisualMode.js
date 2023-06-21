import { useState } from 'react';

export default function useVisualMode(initialMode) {
  const [mode, setMode] = useState(initialMode);
  const [history, setHistory] = useState([initialMode]);

  const transition = (newMode, replace = false) => {
    setMode(newMode);
    setHistory(prevHistory => {
      if (replace) {
        const newHistory = [...prevHistory];
        newHistory.pop();
        return [...newHistory, newMode];
      } else {
        return [...prevHistory, newMode];
      }
    });
  };

  const back = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop();
      const prevMode = newHistory[newHistory.length - 1];
      setMode(prevMode);
      setHistory(newHistory);
    }
  };

  return {
    mode,
    transition,
    back
  };
}
