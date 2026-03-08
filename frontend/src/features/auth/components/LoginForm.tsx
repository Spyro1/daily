import { Google } from "@mui/icons-material";
import { Button, Divider, Stack, TextField } from "@mui/material";

export function LoginForm() {
  return (
    <Stack spacing={2}>
      <TextField id="username" label="Username" variant="outlined" />
      
      <Button variant="outlined">Create local profile</Button>

      <Divider sx={{ mx: 1 }}>Or</Divider>

      <Button variant="contained" color="primary" startIcon={<Google />}>
        Login via Google
      </Button>
    </Stack>
  )
}