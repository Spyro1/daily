import {
    AccountBalanceRounded,
    CreditCardRounded,
    PaymentsRounded,
    SavingsRounded,
    WalletRounded,
    WorkspacesRounded,
} from '@mui/icons-material'
import { alpha } from '@mui/material/styles'
import { MuiColorInput } from 'mui-color-input'
import {
    Box,
    Button,
    ButtonBase,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Switch,
    TextField,
    Typography,
} from '@mui/material'
import { useState } from 'react'
import { PageLayout } from '#/shared/layout/PageLayout'

const ACCOUNT_ICONS = [
    { value: 'wallet', label: 'Wallet', Icon: WalletRounded },
    { value: 'savings', label: 'Savings', Icon: SavingsRounded },
    { value: 'bank', label: 'Bank', Icon: AccountBalanceRounded },
    { value: 'card', label: 'Card', Icon: CreditCardRounded },
    { value: 'cash', label: 'Cash', Icon: PaymentsRounded },
    { value: 'shared', label: 'Shared', Icon: WorkspacesRounded },
] as const

const CURRENCIES = ['HUF', 'USD', 'EUR'] as const

export function CreateAccountPage() {
    const [accountName, setAccountName] = useState('')
    const [balance, setBalance] = useState('0')
    const [currency, setCurrency] = useState<(typeof CURRENCIES)[number]>('USD')
    const [icon, setIcon] = useState<(typeof ACCOUNT_ICONS)[number]['value']>('wallet')
    const [color, setColor] = useState('#14633d')
    const [includeInTotal, setIncludeInTotal] = useState(true)

    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
    }

    return (
        <Box component="form" onSubmit={onSubmit} sx={{ display: 'contents' }}>
            <PageLayout title="Create Account">
                <Paper elevation={2} sx={{ p: 2.5, borderRadius: 1.5 }}>
                    <Stack spacing={2.5} id="create-account-input-fields">
                    <TextField
                        label="Account name"
                        value={accountName}
                        onChange={(event) => setAccountName(event.target.value)}
                        placeholder="Main wallet"
                        autoComplete="off"
                        fullWidth
                        required
                    />

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: 'minmax(0, 1.35fr) minmax(110px, 0.9fr)',
                                sm: 'minmax(0, 1.6fr) minmax(140px, 0.85fr)',
                            },
                            gap: 2,
                        }}
                    >
                        <TextField
                            label="Starting balance"
                            type="number"
                            value={balance}
                            onChange={(event) => setBalance(event.target.value)}
                            inputProps={{ min: 0, step: '0.01' }}
                            fullWidth
                        />

                        <FormControl fullWidth>
                            <InputLabel id="account-currency-label">Currency</InputLabel>
                            <Select
                                labelId="account-currency-label"
                                id="account-currency"
                                value={currency}
                                label="Currency"
                                onChange={(event) => setCurrency(event.target.value as (typeof CURRENCIES)[number])}
                            >
                                {CURRENCIES.map((currencyOption) => (
                                    <MenuItem key={currencyOption} value={currencyOption}>
                                        {currencyOption}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    <Stack spacing={1.25}>
                        <Typography variant="subtitle2">Account icon</Typography>
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                                gap: 1.25,
                            }}
                        >
                            {ACCOUNT_ICONS.map(({ value, label, Icon }) => {
                                const selected = icon === value

                                return (
                                    <ButtonBase
                                        key={value}
                                        type="button"
                                        onClick={() => setIcon(value)}
                                        sx={{ width: '100%', borderRadius: 3, textAlign: 'center' }}
                                    >
                                        <Box
                                            sx={(theme) => ({
                                                width: '100%',
                                                borderRadius: 3,
                                                border: `1px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
                                                backgroundColor: selected
                                                    ? alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.12 : 0.18)
                                                    : theme.palette.background.default,
                                                px: 1,
                                                py: 1.5,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: 0.75,
                                            })}
                                        >
                                            <Icon color={selected ? 'primary' : 'inherit'} />
                                            <Typography variant="body2" fontWeight={selected ? 700 : 600}>
                                                {label}
                                            </Typography>
                                        </Box>
                                    </ButtonBase>
                                )
                            })}
                        </Box>
                    </Stack>

                    <Stack spacing={1.25}>
                        <Typography variant="subtitle2">Account color</Typography>
                        <Box
                            sx={{
                                display: 'flex',
                                // gridTemplateColumns: '56px minmax(0, 1fr)',
                                gap: 1.5,
                                alignItems: 'center',
                            }}
                        >
                            {/* <Box
                                sx={{
                                    height: 56,
                                    borderRadius: 3,
                                    backgroundColor: color,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    boxShadow: `inset 0 0 0 1px ${alpha('#ffffff', 0.35)}`,
                                }}
                            /> */}
                            <MuiColorInput
                                fullWidth
                                isAlphaHidden
                                format="hex"
                                value={color}
                                variant="outlined"
                                onChange={(value) => setColor(value)}
                            />
                            {/* <TextField
                                label="Color"
                                type="color"
                                value={color}
                                onChange={(event) => setColor(event.target.value)}
                                fullWidth
                            /> */}
                        </Box>
                    </Stack>

                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 2,
                            px: 2,
                            py: 1.5,
                            // borderRadius: 3,
                            // border: '1px solid',
                            // borderColor: 'divider',
                            // backgroundColor: 'background.default',
                        }}
                    >
                        <Stack spacing={0.25}>
                            <Typography variant="subtitle2">Include in total</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Count this account when showing the combined balance.
                            </Typography>
                        </Stack>
                        <FormControlLabel
                            sx={{ m: 0 }}
                            control={
                                <Switch
                                    checked={includeInTotal}
                                    onChange={(event) => setIncludeInTotal(event.target.checked)}
                                />
                            }
                            label=""
                        />
                    </Box>
                </Stack>
            </Paper>

            <Button type="submit" variant="contained" color="primary" size="large" fullWidth>
                    Create account
                </Button>
            </PageLayout>
        </Box>
    )
}