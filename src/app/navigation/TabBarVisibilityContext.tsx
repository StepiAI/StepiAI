import { createContext, useContext } from 'react';

export interface TabBarVisibility {
  hidden: boolean;
  setHidden: (hidden: boolean) => void;
}

export const TabBarVisibilityContext = createContext<TabBarVisibility>({
  hidden: false,
  setHidden: () => {},
});

export const useTabBarVisibility = () => useContext(TabBarVisibilityContext);
