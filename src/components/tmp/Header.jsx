import React from "react";
import { AppBar, Toolbar, Typography, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

const Header = ({ toggleSidebar }) => {
  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}> {/* ✅ Sidebar より前面に表示 */}
      <Toolbar>
        <IconButton edge="start" color="inherit" onClick={toggleSidebar(true)} sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" component="div">
          OffTrackApp
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
