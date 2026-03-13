import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    IconButton,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CategoryIcon from '@mui/icons-material/Category';
import PersonIcon from '@mui/icons-material/Person';

const STATUS_COLORS = {
    Draft: 'default',
    Submitted: 'primary',
    'Needs Revision': 'warning',
    Published: 'success',
};

export default function WriterDashboard({ articles, suggestions }) {
    const { flash } = usePage().props;

    const handleSubmit = (articleId) => {
        router.post(route('articles.submit', articleId));
    };

    const handleDelete = (articleId) => {
        if (confirm('Are you sure you want to delete this article?')) {
            router.delete(route('articles.destroy', articleId));
        }
    };

    const canEdit   = (status) => ['Draft', 'Needs Revision'].includes(status);
    const canSubmit = (status) => ['Draft', 'Needs Revision'].includes(status);
    const canDelete = (status) => status === 'Draft';

    return (
        <AuthenticatedLayout
            header={<Typography variant="h6">Writer Dashboard</Typography>}
        >
            <Head title="Writer Dashboard" />
            <Container maxWidth="lg" sx={{ py: 4 }}>

                {flash?.success && (
                    <Alert severity="success" sx={{ mb: 2 }} onClose={() => {}}>
                        {flash.success}
                    </Alert>
                )}
                {flash?.error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {flash.error}
                    </Alert>
                )}

                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Typography variant="h4" component="h1">My Articles</Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        component={Link}
                        href={route('articles.create')}
                    >
                        Create Article
                    </Button>
                </Stack>

                <Paper elevation={2}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>Title</strong></TableCell>
                                    <TableCell><strong>Category</strong></TableCell>
                                    <TableCell><strong>Status</strong></TableCell>
                                    <TableCell><strong>Created</strong></TableCell>
                                    <TableCell align="right"><strong>Actions</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {articles.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                                            <Typography color="text.secondary">
                                                No articles yet. Click "Create Article" to get started!
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : articles.data.map((article) => (
                                    <TableRow key={article.id} hover>
                                        <TableCell>
                                            <Typography fontWeight="medium">{article.title}</Typography>
                                        </TableCell>
                                        <TableCell>{article.category?.name ?? '—'}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={article.status?.name ?? 'Unknown'}
                                                color={STATUS_COLORS[article.status?.name] ?? 'default'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {new Date(article.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                {article.status?.name === 'Published' && (
                                                    <Tooltip title="View Feedback">
                                                        <IconButton
                                                            size="small"
                                                            color="info"
                                                            component={Link}
                                                            href={route('writer.showArticle', article.id)}
                                                        >
                                                            <VisibilityIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {canEdit(article.status?.name) && (
                                                    <Tooltip title="Edit Article">
                                                        <IconButton
                                                            size="small"
                                                            color="primary"
                                                            component={Link}
                                                            href={route('articles.edit', article.id)}
                                                        >
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {canSubmit(article.status?.name) && (
                                                    <Tooltip title="Submit for Review">
                                                        <IconButton
                                                            size="small"
                                                            color="success"
                                                            onClick={() => handleSubmit(article.id)}
                                                        >
                                                            <SendIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {canDelete(article.status?.name) && (
                                                    <Tooltip title="Delete Article">
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => handleDelete(article.id)}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>

                {/* Pagination */}
                {articles.last_page > 1 && (
                    <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 3 }}>
                        {articles.links.map((link, i) => (
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

                {/* Student Suggestions Section */}
                <Box sx={{ mt: 5 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                        <LightbulbIcon sx={{ color: '#C2410C', fontSize: 28 }} />
                        <Typography variant="h5" component="h2">Student Suggestions</Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Article topics suggested by students. Use these as inspiration for your next article!
                    </Typography>

                    {(!suggestions || suggestions.data.length === 0) ? (
                        <Card elevation={1}>
                            <CardContent sx={{ py: 4, textAlign: 'center' }}>
                                <Typography color="text.secondary">No suggestions from students yet.</Typography>
                            </CardContent>
                        </Card>
                    ) : (
                        <Stack spacing={2}>
                            {suggestions.data.map((suggestion) => (
                                <Card key={suggestion.id} elevation={1} sx={{ borderLeft: '4px solid #C2410C' }}>
                                    <CardContent>
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                                            <Typography variant="subtitle1" fontWeight="bold">{suggestion.title}</Typography>
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
                                        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap', mb: 1 }}>
                                            {suggestion.description}
                                        </Typography>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <PersonIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                                            <Typography variant="caption" color="text.disabled">
                                                Suggested by {suggestion.user?.name} &mdash; {new Date(suggestion.created_at).toLocaleDateString()}
                                            </Typography>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            ))}
                        </Stack>
                    )}

                    {suggestions?.last_page > 1 && (
                        <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2 }}>
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
                </Box>

            </Container>
        </AuthenticatedLayout>
    );
}
