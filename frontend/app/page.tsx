'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

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
import { useAuthStore } from "@/app/store/authStore";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cpassword, setCPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [newUser, setNewUser] = useState(false);

  const router = useRouter();

  const loginUser = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const encodedCredentials = btoa(`${email}:${password}`);

    if (!newUser) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: "GET",
        headers: {
          "Authorization": `Basic ${encodedCredentials}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
        .then(async (response) => {
          const data = await response.json();
          useAuthStore.getState().setAuth(
            data.user,
            data.accessToken
          );

          router.push("/user-home");
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } else {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
        method: "GET",
        headers: {
          "Authorization": `Basic ${encodedCredentials}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
        .then(async (response) => {
          const data = await response.json();
          useAuthStore.getState().setAuth(
            data.user,
            data.accessToken
          );

          router.push("/user-home");
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  };

  const cleanStates = () => {
    setEmail("");
    setPassword("");
    setCPassword("");
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
          <Typography variant="h4">
            Welcome to Online Docs
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1, mb: 4 }}
          >
            Sign in to access your documents
          </Typography>

          <Box component="form" onSubmit={loginUser}>
            <TextField
              fullWidth
              required
              id="email"
              label="Email"
              type="email"
              variant="outlined"
              margin="normal"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
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
                value={password}
                onChange={(event) => setPassword(event.target.value)}
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
                disabled={password.length === 0 || email.length === 0}
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
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
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
                  value={cpassword}
                  onChange={(event) => setCPassword(event.target.value)}
                  error={cpassword !== password && cpassword.length > 0}
                  helperText={cpassword !== password && cpassword.length > 0 ? "Passwords do not match" : ""}
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
                  disabled={cpassword !== password || password.length === 0 || email.length === 0}
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
                onClick={(event) => {
                  event.preventDefault();
                  cleanStates();
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
                onClick={(event) => {
                  event.preventDefault();
                  cleanStates();
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