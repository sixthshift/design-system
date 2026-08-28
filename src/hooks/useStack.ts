"use client";

import { type Dispatch, type Reducer, startTransition, useCallback, useEffect, useReducer } from "react";

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

  useEffect(() => {
    const itemsToRemove = state.filter((item) => item.transition);

    if (itemsToRemove.length === 0) {
      return;
    }

    itemsToRemove.reverse().forEach((itemToRemove) => {
      setTimeout(
        () => {
          dispatch({ type: "remove", id: itemToRemove.id });
        }, // We found the item by the `transition` property, so we can be sure it exists.
        (itemToRemove.transition as Transition).duration
      );
    });
  }, [state]);

  // Memoize the dispatch wrapper to prevent unnecessary re-renders
  // dispatch from useReducer is stable, so this only creates once
  const wrappedDispatch = useCallback((params: Action<T>) => {
    startTransition(() => {
      dispatch(params);
    });
  }, []);

  return [state, wrappedDispatch];
}
