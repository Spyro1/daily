import { Stack, Typography, Button, TextField, Chip } from "@mui/material";

export function DemoPage() {
    return (
        <Stack direction="column" spacing={1} sx={{ mb: 2 }}>
            <Typography variant="h1">Heading1</Typography>
            <Typography variant="h2">Heading2</Typography>
            <Typography variant="h3">Heading3</Typography>
            <Typography variant="h4">Heading4</Typography>
            <Typography variant="h5">Heading5</Typography>
            <Typography variant="h6">Heading6</Typography>
            <Button variant="contained">Primary</Button>
            <Button variant="outlined">Primary Outlined</Button>
            <Button>Primary subtle</Button>
            <Button variant="contained" color="secondary">Secondary</Button>
            <Button variant="outlined" color="secondary">Secondary Outlined</Button>
            <Button color="secondary">Secondary subtle</Button>
            <TextField label="Text Field Standard" variant="standard" />
            <TextField label="Text Field Outlined" variant="outlined" />
            <TextField label="Text Field Filled" variant="filled" />
            <Chip label="Chip Filled"/>
            <Chip label="Chip Outlined" variant="outlined"/>
            <Chip label="Chip Primary" color="primary"/>
            <Chip label="Chip Primary Outlined" variant="outlined" color="primary"/>
            <Chip label="Chip Secondary" color="secondary"/>
            <Chip label="Chip Secondary Outlined" variant="outlined" color="secondary"/>
            <Chip label="Chip Success" color="success"/>
            <Chip label="Chip Warning" color="warning"/>
            <Chip label="Chip Error" color="error"/>
            <Chip label="Chip Info" color="info"/>
        </Stack>
    )
}