import { PageLayout } from "@/shared/layout/PageLayout";
import { FormControl, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";

export function CreateAccountPage() {
    return (
        <PageLayout verticalAlign="flex-start">
            <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
                Create New Account
            </Typography>
            <TextField label="Account name" variant="standard" fullWidth sx={{ mb: 2 }} />
            <TextField label="Balance" variant="standard" fullWidth sx={{ mb: 2 }} />
            {/* <FormControl fullWidth>
                <InputLabel id="select-account">Account Type</InputLabel>
                <Select
                    labelId="select-account"
                    id="select-account"
                    variant="standard"
                    label="Account Type"
                    // value={age}
                    // onChange={handleChange}
                >
                    <MenuItem value={10}>Ten</MenuItem>
                    <MenuItem value={20}>Twenty</MenuItem>
                    <MenuItem value={30}>Thirty</MenuItem>
                </Select>
            </FormControl> */}

        </PageLayout>
    )
}