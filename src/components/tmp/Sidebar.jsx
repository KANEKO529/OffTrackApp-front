// import React from "react";
// import { Drawer, List, ListItem, ListItemText, IconButton, Toolbar, Typography} from "@mui/material";
// import MenuIcon from "@mui/icons-material/Menu";
// import { Link } from "react-router-dom";

// const Sidebar = ({ open, toggleSidebar }) => {
//   return (
//     <>
//       {/* <Toolbar>
//         <IconButton onClick={toggleSidebar(true)} sx={{ position: "absolute", top: 10, left: 10, zIndex: 1500 }}>
//             <MenuIcon />
//         </IconButton>

//         <Typography variant="h6" component="div">
//           オフまっぷ
//         </Typography>
//       </Toolbar> */}
//       {/* サイドバーボタン */}


//       {/* サイドバー（Drawer） */}
//       <Drawer
//         anchor="left"
//         open={open}
//         onClose={toggleSidebar(false)}
//         sx={{ zIndex: (theme) => theme.zIndex.appBar - 1 }} // ✅ AppBar の下にならないよう調整
//       >
//         <List sx={{ width: 250 }}>
//           <ListItem button component={Link} to="/dashboard" onClick={toggleSidebar(false)}>
//             <ListItemText primary="ホーム" />
//           </ListItem>
//           <ListItem button component={Link} to="/visit-record-form" onClick={toggleSidebar(false)}>
//             <ListItemText primary="訪問記録フォーム" />
//           </ListItem>
//           <ListItem button component={Link} to="/visit-record-form1" onClick={toggleSidebar(false)}>
//             <ListItemText primary="訪問記録フォーム 仮" />
//           </ListItem>
//           <ListItem button component={Link} to="/stores" onClick={toggleSidebar(false)}>
//             <ListItemText primary="訪問記録表" />
//           </ListItem>
//           <ListItem button component={Link} to="/visit-records" onClick={toggleSidebar(false)}>
//             <ListItemText primary="店舗表" />
//           </ListItem>
//         </List>
//       </Drawer>
//     </>
//   );
// };

// export default Sidebar;
