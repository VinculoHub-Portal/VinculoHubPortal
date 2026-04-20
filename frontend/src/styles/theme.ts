import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  components: {
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          fontSize: 24,
          display: "block",
        },
      },
    },
  },
});

export default theme;
