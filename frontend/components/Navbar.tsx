import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

export interface NavbarProps {
    isLoggedIn: boolean;
};

export default function Navbar({ isLoggedIn }: NavbarProps) {
    return (
        <Box>
            <AppBar position="static" color="secondary">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Online Docs
                    </Typography>
                    {isLoggedIn ? <Button color="inherit">Logout</Button> : <Button color="inherit">Login</Button> }
                </Toolbar>
            </AppBar>
        </Box>
    );
}