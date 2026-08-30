"use client";

import { type Dispatch, type Reducer, startTransition, useCallback, useEffect, useReducer, useRef } from "react";

type Id = string | number;
type Transition = {
  duration: number;
};

export type StackItem = {
  id: Id;
  transition?: Transition;
};

type Action<T extends StackItem> =
  | { type: "push"; item: T }
  | { type: "pop"; transition?: Transition }
  | { type: "remove"; id: Id; transition?: Transition }
  | { type: "update"; item: Partial<T> & StackItem }
  | { type: "clear"; transition?: Transition };

export type StackDispatch<T extends StackItem> = Dispatch<Action<T>>;

function createReducer<T extends StackItem>(): Reducer<T[], Action<T>> {
  return (state: T[], action: Action<T>) => {
    switch (action.type) {
      case "push": {
        if (state.some((item) => item.id === action.item.id)) {
          return state;
        } else {
          return [...state, action.item];
        }
      }
      case "pop": {
        const firstItems = state.slice(0, -1);
        if (action.transition) {
          const lastItem = {
            ...state.at(-1),
            transition: action.transition,
          } as T;
          return [...firstItems, lastItem];
        }

        return firstItems;
      }
      case "remove": {
        if (action.transition) {
          return state.map((s) => (s.id !== action.id ? s : { ...s, transition: action.transition }));
        }

        return state.filter((s) => s.id !== action.id);
      }
      case "update": {
        return state.map((s) => (s.id !== action.item.id ? s : { ...s, ...action.item }));
      }
      case "clear": {
        if (action.transition) {
          // Mark all items for transition-based removal
          return state.map((s) => ({ ...s, transition: action.transition }));
        }
        return [];
      }
      default: {
        return state;
      }
    }
  };
}

export function useStack<T extends StackItem>(initialStack: T[] = []): [T[], StackDispatch<T>] {
  const reducer = createReducer<T>();

  const [state, dispatch] = useReducer(reducer, initialStack);

  // One removal timer per transitioning item. The effect re-runs on every
  // state change, so timers are tracked in a ref keyed by item id: an item
  // already scheduled is never scheduled again (re-running the effect must not
  // reset or duplicate its countdown), and a timer whose item has left the
  // stack by other means is cancelled rather than left to fire at a reused id.
  const removalTimersRef = useRef(new Map<Id, ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const timers = removalTimersRef.current;
    const transitioning = new Set(state.filter((item) => item.transition).map((item) => item.id));

    for (const [id, timer] of timers) {
      if (!transitioning.has(id)) {
        clearTimeout(timer);
        timers.delete(id);
      }
    }

    for (const item of state) {
      if (!item.transition || timers.has(item.id)) continue;
      const timer = setTimeout(() => {
        timers.delete(item.id);
        dispatch({ type: "remove", id: item.id });
      }, item.transition.duration);
      timers.set(item.id, timer);
    }
  }, [state]);

  // Unmount only: without this, a stack unmounted mid-transition dispatches
  // into an unmounted reducer.
  useEffect(() => {
    const timers = removalTimersRef.current;
    return () => {
      for (const timer of timers.values()) clearTimeout(timer);
      timers.clear();
    };
  }, []);

  // Memoize the dispatch wrapper to prevent unnecessary re-renders
  // dispatch from useReducer is stable, so this only creates once
  const wrappedDispatch = useCallback((params: Action<T>) => {
    startTransition(() => {
      dispatch(params);
    });
  }, []);

  return [state, wrappedDispatch];
}
