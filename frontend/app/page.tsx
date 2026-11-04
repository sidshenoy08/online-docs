'use client';

import { useState } from "react";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";

import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import Navbar from "@/components/Navbar";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [newUser, setNewUser] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Add your login logic here
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar isLoggedIn={false} />

      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "grey.50",
          p: 3,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            width: "100%",
            maxWidth: 420,
            p: 4,
            borderRadius: 3,
          }}
        >
          <Typography variant="h4" fontWeight="bold" textAlign="center">
            Welcome to Online Docs
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            sx={{ mt: 1, mb: 4 }}
          >
            Sign in to access your documents
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              required
              id="email"
              label="Email"
              type="email"
              variant="outlined"
              margin="normal"
              autoComplete="email"
            />

            {!newUser ? <>
              <TextField
                fullWidth
                required
                id="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                margin="normal"
                autoComplete="current-password"
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((prev) => !prev)}
                          edge="end"
                          aria-label="Toggle password visibility"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="secondary"
                sx={{
                  mt: 3,
                  py: 1.3,
                  borderRadius: 2,
                  textTransform: "none",
                  fontSize: "1rem",
                }}
              >
                Sign In
              </Button>
            </> :
              <>
                <TextField
                  fullWidth
                  required
                  id="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  variant="outlined"
                  margin="normal"
                  autoComplete="current-password"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword((prev) => !prev)}
                            edge="end"
                            aria-label="Toggle password visibility"
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <TextField
                  fullWidth
                  required
                  id="confirm-password"
                  label="Confirm Password"
                  type={showPassword ? "text" : "password"}
                  variant="outlined"
                  margin="normal"
                  autoComplete="current-password"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword((prev) => !prev)}
                            edge="end"
                            aria-label="Toggle password visibility"
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="secondary"
                  sx={{
                    mt: 3,
                    py: 1.3,
                    borderRadius: 2,
                    textTransform: "none",
                    fontSize: "1rem",
                  }}
                >
                  Register
                </Button>
              </>}
          </Box>


          {!newUser ? <>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 3 }}
            >
              Don't have an account?{" "}
              <Link
                component="button"
                color="secondary"
                fontWeight="bold"
                sx={{ textDecoration: "none" }}
                onClick={(e) => {
                  e.preventDefault();
                  setNewUser(true);
                }}
              >
                Sign up
              </Link>
            </Typography>
          </> : <>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 3 }}
            >
              Already have an account?{" "}
              <Link
                component="button"
                color="secondary"
                fontWeight="bold"
                sx={{ textDecoration: "none" }}
                onClick={(e) => {
                  e.preventDefault();
                  setNewUser(false);
                }}
              >
                Sign in
              </Link>
            </Typography>
          </>}

          {/* <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            sx={{ mt: 3 }}
          >
            Don't have an account?{" "}
            <Typography
              component="a"
              href="/signup"
              color="secondary"
              fontWeight="bold"
              sx={{ textDecoration: "none" }}
              onClick={(e) => {
                e.preventDefault();
                setNewUser(true);
              }}
            >
              Sign up
            </Typography>
          </Typography> */}
        </Paper>
      </Box>
    </Box>
  );
}