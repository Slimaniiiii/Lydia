import { createContext } from "react";

export const ThemeContext = createContext(null);

export const localStorageTheme = async (theme) => {
  const user = await JSON.parse(
    localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
  );
  user.theme = theme;
  localStorage.setItem(
    process.env.REACT_APP_LOCALHOST_KEY,
    JSON.stringify(user)
  );
};
