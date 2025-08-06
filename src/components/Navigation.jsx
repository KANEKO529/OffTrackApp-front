import React, { useState } from "react";
import { AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemText } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link } from "react-router-dom";

const NAVBAR_HEIGHT = "50px"; // AppBar の高さ

const Navigation = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ボタンを押すたびに開閉
  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <>
      {/* AppBar（ヘッダー） */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1, 
          backgroundColor: "#202123",  // ChatGPT ダークモードのメイン背景色
          height: NAVBAR_HEIGHT, // 高さを統一
        }}
      >
        <Toolbar sx={{ minHeight: NAVBAR_HEIGHT }}> {/* Toolbar の高さを統一 */}
          <IconButton edge="start" color="inherit" onClick={toggleSidebar} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div">
            おふマップ
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar（Drawer） */}
      <Drawer
        anchor="left"
        open={sidebarOpen}
        onClose={toggleSidebar}
        sx={{ 
          zIndex: (theme) => theme.zIndex.appBar - 1,  // AppBar の下に配置
        }}
        PaperProps={{
          sx: { 
            top: NAVBAR_HEIGHT, // AppBar の高さ分ずらす
            height: `calc(100% - ${NAVBAR_HEIGHT})` // AppBar に隠れないよう調整
          }
        }}
      >
        <List sx={{ width: 180}}>
          <ListItem button component={Link} to="/dashboard" onClick={toggleSidebar} sx={{ color: "black" }}>
            <ListItemText primary="ダッシュボード" />
          </ListItem>
          {/* <ListItem button component={Link} to="/visit-record-form" onClick={toggleSidebar} sx={{ color: "black" }}>
            <ListItemText primary="訪問記録フォーム" />
          </ListItem> */}
          <ListItem button component={Link} to="/visit-record-form1" onClick={toggleSidebar} sx={{ color: "black" }}>
            <ListItemText primary="訪問記録フォーム" />
          </ListItem>
          <ListItem button component={Link} to="/visit-records" onClick={toggleSidebar} sx={{ color: "black" }}>
            <ListItemText primary="訪問記録表" />
          </ListItem>
          <ListItem button component={Link} to="/stores" onClick={toggleSidebar} sx={{ color: "black" }}>
            <ListItemText primary="店舗表" />
          </ListItem>
        </List>
      </Drawer>
    </>
  );
};

export default Navigation;
