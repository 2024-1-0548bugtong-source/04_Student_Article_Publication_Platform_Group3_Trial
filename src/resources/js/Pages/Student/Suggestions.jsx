import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    MenuItem,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CategoryIcon from '@mui/icons-material/Category';

export default function Suggestions({ suggestions, categories }) {
    const { flash } = usePage().props;
    const [dialogOpen, setDialogOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        category_id: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('student.store-suggestion'), {
            onSuccess: () => { setDialogOpen(false); reset(); },
        });
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this suggestion?')) {
            router.delete(route('student.delete-suggestion', id));
        }
    };

    return (
        <AuthenticatedLayout
            header={<Typography variant="h6">My Suggestions</Typography>}
        >
            <Head title="My Suggestions" />
            <Container maxWidth="lg" sx={{ py: 4 }}>

                {flash?.success && (
                    <Alert severity="success" sx={{ mb: 2 }} onClose={() => {}}>
                        {flash.success}
                    </Alert>
                )}

                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <LightbulbIcon sx={{ color: '#C2410C', fontSize: 32 }} />
                        <Typography variant="h4" component="h1">My Suggestions for Writers</Typography>
                    </Stack>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setDialogOpen(true)}
                    >
                        New Suggestion
                    </Button>
                </Stack>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Suggest article topics you'd like writers to cover. Writers can see all suggestions and may use them as inspiration!
                </Typography>

                {suggestions.data.length === 0 ? (
                    <Card elevation={2}>
                        <CardContent sx={{ py: 6, textAlign: 'center' }}>
                            <LightbulbIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                            <Typography color="text.secondary">
                                You haven't submitted any suggestions yet.
                            </Typography>
                            <Button
                                variant="outlined"
                                sx={{ mt: 2 }}
                                startIcon={<AddIcon />}
                                onClick={() => setDialogOpen(true)}
                            >
                                Submit Your First Suggestion
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <Stack spacing={2}>
                        {suggestions.data.map((suggestion) => (
                            <Card key={suggestion.id} elevation={2}>
                                <CardContent>
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                        <Box sx={{ flex: 1 }}>
                                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                                <Typography variant="h6">{suggestion.title}</Typography>
                                                {suggestion.category && (
                                                    <Chip
                                                        icon={<CategoryIcon />}
                                                        label={suggestion.category.name}
                                                        size="small"
                                                        color="primary"
                                                        variant="outlined"
                                                    />
                                                )}
                                            </Stack>
                                            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                                                {suggestion.description}
                                            </Typography>
                                            <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>
                                                Submitted {new Date(suggestion.created_at).toLocaleDateString()}
                                            </Typography>
                                        </Box>
                                        <Tooltip title="Delete suggestion">
                                            <IconButton
                                                color="error"
                                                size="small"
                                                onClick={() => handleDelete(suggestion.id)}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                )}

                {/* Pagination */}
                {suggestions.last_page > 1 && (
                    <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 3 }}>
                        {suggestions.links.map((link, i) => (
                            <Button
                                key={i}
                                variant={link.active ? 'contained' : 'outlined'}
                                size="small"
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                            >
                                <span dangerouslySetInnerHTML={{ __html: link.label }} />
                            </Button>
                        ))}
                    </Stack>
                )}

                {/* New Suggestion Dialog */}
                <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                    <form onSubmit={handleSubmit}>
                        <DialogTitle>Suggest an Article Topic</DialogTitle>
                        <DialogContent>
                            <Stack spacing={2} sx={{ mt: 1 }}>
                                <TextField
                                    label="Suggestion Title"
                                    placeholder="e.g., The Impact of AI on Education"
                                    fullWidth
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    error={!!errors.title}
                                    helperText={errors.title}
                                    required
                                />
                                <TextField
                                    select
                                    label="Category (optional)"
                                    fullWidth
                                    value={data.category_id}
                                    onChange={(e) => setData('category_id', e.target.value)}
                                >
                                    <MenuItem value="">No specific category</MenuItem>
                                    {categories.map((cat) => (
                                        <MenuItem key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                                <TextField
                                    label="Description"
                                    placeholder="Describe the topic you'd like to read about..."
                                    multiline
                                    rows={4}
                                    fullWidth
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    error={!!errors.description}
                                    helperText={errors.description}
                                    required
                                />
                            </Stack>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={processing || !data.title.trim() || !data.description.trim()}
                            >
                                Submit Suggestion
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>

            </Container>
        </AuthenticatedLayout>
    );
}
