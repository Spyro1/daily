import { useEffect, useState } from 'react'
import {
  BusinessCenterRounded,
  CardGiftcardRounded,
  CategoryRounded,
  DeleteRounded,
  DirectionsCarRounded,
  FastfoodRounded,
  HomeRounded,
  LaptopRounded,
  LocalAtmRounded,
  LocalHospitalRounded,
  MovieRounded,
  ReceiptLongRounded,
  SellRounded,
  ShoppingBagRounded,
  TrendingUpRounded,
  WorkRounded,
} from '@mui/icons-material'
import { alpha } from '@mui/material/styles'
import { MuiColorInput } from 'mui-color-input'
import {
  Box,
  Button,
  ButtonBase,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  TextField,
} from '@mui/material'
import { useNavigate, useParams } from '@tanstack/react-router'
import { CategoryType } from '@/api/generated'
import type { CreateCategory } from '@/api/generated'
import { PageLayout } from '#/shared/layout/PageLayout'
import { useNotify } from '#/shared/providers/SnackbarProvider'
import { buildCategoryTreeOptions } from './categoryTree'
import { useCategories, useUpdateCategory, useDeleteCategory } from './hooks/useCategories'

const EXPENSE_ICONS = [
  { value: 'general', label: 'General', Icon: CategoryRounded },
  { value: 'food', label: 'Food', Icon: FastfoodRounded },
  { value: 'shopping', label: 'Shopping', Icon: ShoppingBagRounded },
  { value: 'home', label: 'Home', Icon: HomeRounded },
  { value: 'bills', label: 'Bills', Icon: ReceiptLongRounded },
  { value: 'transport', label: 'Transport', Icon: DirectionsCarRounded },
  { value: 'health', label: 'Health', Icon: LocalHospitalRounded },
  { value: 'fun', label: 'Fun', Icon: MovieRounded },
] as const

const INCOME_ICONS = [
  { value: 'salary', label: 'Salary', Icon: WorkRounded },
  { value: 'freelance', label: 'Freelance', Icon: LaptopRounded },
  { value: 'business', label: 'Business', Icon: BusinessCenterRounded },
  { value: 'investment', label: 'Invest', Icon: TrendingUpRounded },
  { value: 'gift', label: 'Gift', Icon: CardGiftcardRounded },
  { value: 'cash', label: 'Cash', Icon: LocalAtmRounded },
  { value: 'sale', label: 'Sale', Icon: SellRounded },
  { value: 'other', label: 'Other', Icon: CategoryRounded },
] as const

const ICONS_BY_TYPE = {
  [CategoryType.Expense]: EXPENSE_ICONS,
  [CategoryType.Income]: INCOME_ICONS,
} as const

function toParentId(value: string): CreateCategory['parent_id'] {
  return value ? value : null
}

export function EditCategoryPage() {
  const { id } = useParams({ strict: false }) as { id: string }
  const navigate = useNavigate()
  const notify = useNotify()
  const { data: categories } = useCategories()
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory()
  const { mutate: deleteCategory, isPending: isDeleting } = useDeleteCategory()

  const category = categories?.find((c) => c.id === id)

  const [name, setName] = useState('')
  const [type, setType] = useState<CategoryType>(CategoryType.Expense)
  const [parentId, setParentId] = useState('')
  const [icon, setIcon] = useState<string>('general')
  const [color, setColor] = useState('#ef5350')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (category && !initialized) {
      setName(category.name)
      setType(category.type)
      setParentId(category.parent_id ?? '')
      setIcon(category.icon_name)
      setColor(category.color ?? (category.type === CategoryType.Expense ? '#ef5350' : '#66bb6a'))
      setInitialized(true)
    }
  }, [category, initialized])

  const isPending = isUpdating || isDeleting
  const activeIcons = ICONS_BY_TYPE[type]

  // Reset icon when type changes, but not during initialisation
  useEffect(() => {
    if (!initialized) return
    const validValues = ICONS_BY_TYPE[type].map((i) => i.value) as string[]
    if (!validValues.includes(icon)) {
      setIcon(ICONS_BY_TYPE[type][0].value)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type])

  // Exclude the current category (and its descendants) from parent options
  const parentOptions = buildCategoryTreeOptions(
    categories?.filter((c) => c.id !== id),
    type,
  )
  const selectedParent = parentOptions.find((o) => o.id === parentId)

  useEffect(() => {
    if (parentId && !parentOptions.some((o) => o.id === parentId)) {
      setParentId('')
    }
  }, [parentId, parentOptions])

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return

    updateCategory(
      {
        id,
        data: {
          name: trimmedName,
          parent_id: toParentId(parentId),
          icon_name: icon,
          color,
          type,
        },
      },
      {
        onSuccess: () => {
          notify('Category updated.', 'success')
          void navigate({ to: '/categories' })
        },
      },
    )
  }

  const onDelete = () => {
    deleteCategory(id, {
      onSuccess: () => {
        notify('Category deleted.', 'success')
        void navigate({ to: '/categories' })
      },
    })
    setDeleteDialogOpen(false)
  }

  if (!categories) {
    return <PageLayout title="Edit Category"><Paper elevation={2} sx={{ p: 2.5, borderRadius: 1.5 }}>Loading...</Paper></PageLayout>
  }

  if (!category) {
    return <PageLayout title="Edit Category"><Paper elevation={2} sx={{ p: 2.5, borderRadius: 1.5 }}>Category not found.</Paper></PageLayout>
  }

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ display: 'contents' }}>
      <PageLayout title="Edit Category">
        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 1.5 }}>
          <Stack spacing={2.5}>
            <Stack spacing={1}>
              <Typography variant="subtitle2">Category type</Typography>
              <ToggleButtonGroup
                exclusive
                fullWidth
                size="small"
                value={type}
                disabled={isPending}
                onChange={(_, value: CategoryType | null) => {
                  if (value) setType(value)
                }}
              >
                <ToggleButton value={CategoryType.Expense}>Expense</ToggleButton>
                <ToggleButton value={CategoryType.Income}>Income</ToggleButton>
              </ToggleButtonGroup>
            </Stack>

            <TextField
              label="Category name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
              disabled={isPending}
              fullWidth
              required
            />

            <FormControl fullWidth>
              <InputLabel id="category-parent-label" shrink>Parent category</InputLabel>
              <Select
                labelId="category-parent-label"
                value={parentId}
                label="Parent category"
                disabled={isPending}
                displayEmpty
                renderValue={(selected) => {
                  if (!selected) return 'Top-level category'
                  return selectedParent?.pathLabel ?? 'Top-level category'
                }}
                onChange={(e) => setParentId(e.target.value)}
              >
                <MenuItem value="">Top-level category</MenuItem>
                {parentOptions.map((option) => (
                  <MenuItem key={option.id} value={option.id}>{option.pathLabel}</MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {selectedParent
                  ? `This category will be placed under ${selectedParent.pathLabel}.`
                  : 'Top-level category.'}
              </FormHelperText>
            </FormControl>

            <Stack spacing={1.25}>
              <Typography variant="subtitle2">Category icon</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 1.25 }}>
                {activeIcons.map(({ value, label, Icon }) => {
                  const selected = icon === value
                  return (
                    <ButtonBase
                      key={value}
                      type="button"
                      onClick={() => setIcon(value)}
                      disabled={isPending}
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
                        <Typography variant="body2" fontWeight={selected ? 700 : 600}>{label}</Typography>
                      </Box>
                    </ButtonBase>
                  )
                })}
              </Box>
            </Stack>

            <Stack spacing={1.25}>
              <Typography variant="subtitle2">Category color</Typography>
              <MuiColorInput
                fullWidth
                isAlphaHidden
                format="hex"
                value={color}
                variant="outlined"
                disabled={isPending}
                onChange={(value) => setColor(value)}
              />
            </Stack>
          </Stack>
        </Paper>

        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" color="error" onClick={() => setDeleteDialogOpen(true)} disabled={isPending} aria-label="Delete">
            <DeleteRounded />
          </Button>
          <Button variant="outlined" fullWidth onClick={() => void navigate({ to: '/categories' })} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" fullWidth disabled={isPending}>
            {isUpdating ? 'Saving...' : 'Save'}
          </Button>
        </Stack>

        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete category?</DialogTitle>
          <DialogContent>
            <DialogContentText>This will permanently remove this category. Transactions using it will lose their category.</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={onDelete} color="error" variant="contained">Delete</Button>
          </DialogActions>
        </Dialog>
      </PageLayout>
    </Box>
  )
}
