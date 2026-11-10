import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import { useRouter } from "next/navigation";

import { useAuthStore } from '@/app/store/authStore';


export default function Navbar() {
  const router = useRouter();

  console.log(useAuthStore.getState());

  async function logout() {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } finally {
      useAuthStore.getState().clearAuth();
      router.push("/");
    }
  }

  return (
    <Box>
      <AppBar position="static" color="secondary">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Online Docs
          </Typography>
          {useAuthStore.getState().isAuthenticated ? <Button onClick={logout} color="inherit">Logout</Button> : <></>}
        </Toolbar>
      </AppBar>
    </Box>
  );
}