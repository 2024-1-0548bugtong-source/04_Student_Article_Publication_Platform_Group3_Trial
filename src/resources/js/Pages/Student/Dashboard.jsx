import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Chip,
    Container,
    Divider,
    IconButton,
    InputAdornment,
    Rating,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import CommentIcon from '@mui/icons-material/Comment';
import StarIcon from '@mui/icons-material/Star';
import SearchIcon from '@mui/icons-material/Search';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EditIcon from '@mui/icons-material/Edit';
import { useState, useCallback, useMemo } from 'react';

export default function StudentDashboard({ articles, popularArticles, categories, writers, filters, writerApplication, isAlsoWriter, bookmarkedIds }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters?.search ?? '');
    const selectedCategory = categories?.find(c => String(c.id) === String(filters?.category)) || null;
    const selectedWriter = writers?.find(w => String(w.id) === String(filters?.writer)) || null;
    const [categoryValue, setCategoryValue] = useState(selectedCategory);
    const [writerValue, setWriterValue] = useState(selectedWriter);
    const [writerReason, setWriterReason] = useState('');
    const [showApplyForm, setShowApplyForm] = useState(false);

    const bookmarkSet = useMemo(() => new Set(bookmarkedIds || []), [bookmarkedIds]);

    // Sort articles: bookmarked first, then by original order
    const sortedArticles = useMemo(() => {
        if (!articles?.data) return [];
        return [...articles.data].sort((a, b) => {
            const aBookmarked = bookmarkSet.has(a.id) ? 1 : 0;
            const bBookmarked = bookmarkSet.has(b.id) ? 1 : 0;
            return bBookmarked - aBookmarked;
        });
    }, [articles?.data, bookmarkSet]);

    const applyFilters = useCallback((overrides = {}) => {
        const params = {
            search: search || undefined,
            category: categoryValue?.id ? String(categoryValue.id) : undefined,
            writer: writerValue?.id ? String(writerValue.id) : undefined,
            ...overrides,
        };
        Object.keys(params).forEach(k => { if (!params[k]) delete params[k]; });
        router.get(route('student.dashboard'), params, { preserveState: true });
    }, [search, categoryValue, writerValue]);

    const handleSearch = useCallback((e) => {
        e.preventDefault();
        applyFilters();
    }, [applyFilters]);

    const handleCategoryChange = useCallback((_, newVal) => {
        setCategoryValue(newVal);
        applyFilters({ category: newVal?.id ? String(newVal.id) : undefined });
    }, [applyFilters]);

    const handleWriterChange = useCallback((_, newVal) => {
        setWriterValue(newVal);
        applyFilters({ writer: newVal?.id ? String(newVal.id) : undefined });
    }, [applyFilters]);

    const handleClear = useCallback(() => {
        setSearch('');
        setCategoryValue(null);
        setWriterValue(null);
        router.get(route('student.dashboard'), {}, { preserveState: true });
    }, []);

    const hasActiveFilters = search || categoryValue || writerValue;

    return (
        <AuthenticatedLayout
            header={<Typography variant="h6">Student Dashboard</Typography>}
        >
            <Head title="Student Dashboard" />
            <Container maxWidth="lg" sx={{ py: 4 }}>

                {flash?.success && (
                    <Alert severity="success" sx={{ mb: 2 }}>{flash.success}</Alert>
                )}
                {flash?.error && (
                    <Alert severity="error" sx={{ mb: 2 }}>{flash.error}</Alert>
                )}

                {/* Popular Articles Section */}
                {popularArticles && popularArticles.length > 0 && (
                    <Box sx={{ mb: 4 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                            <TrendingUpIcon color="secondary" />
                            <Typography variant="h5" component="h2">
                                Popular Articles
                            </Typography>
                        </Stack>
                        <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>
                            {popularArticles.map((article) => (
                                <Card
                                    key={article.id}
                                    elevation={3}
                                    sx={{
                                        minWidth: 260,
                                        maxWidth: 300,
                                        flex: '0 0 auto',
                                        borderTop: 3,
                                        borderColor: 'secondary.main',
                                        transition: '.2s',
                                        '&:hover': { transform: 'translateY(-2px)' },
                                    }}
                                >
                                    <CardContent sx={{ pb: 1 }}>
                                        <Chip label={article.category?.name} size="small" color="primary" variant="outlined" sx={{ mb: 1 }} />
                                        <Typography variant="subtitle1" fontWeight="bold" sx={{ lineHeight: 1.3, mb: 0.5 }}>
                                            {article.title}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            By {article.writer?.name}
                                        </Typography>
                                        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 1 }}>
                                            <Rating value={parseFloat(article.reviews_avg_rating)} precision={0.1} readOnly size="small" />
                                            <Typography variant="caption" color="text.secondary">
                                                ({article.reviews_count})
                                            </Typography>
                                        </Stack>
                                    </CardContent>
                                    <CardActions sx={{ pt: 0, px: 2, pb: 1.5 }}>
                                        <Button size="small" variant="outlined" component={Link} href={route('student.show', article.id)}>
                                            Read
                                        </Button>
                                    </CardActions>
                                </Card>
                            ))}
                        </Box>
                    </Box>
                )}

                <Divider sx={{ mb: 3 }} />

                {/* Filters Section */}
                <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
                    Browse Articles
                </Typography>

                <Box component="form" onSubmit={handleSearch} sx={{ mb: 3 }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
                        <TextField
                            size="small"
                            placeholder="Search articles..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            sx={{ minWidth: { md: 280 } }}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon color="action" />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                        <Autocomplete
                            size="small"
                            options={categories || []}
                            getOptionLabel={(opt) => opt.name}
                            value={categoryValue}
                            onChange={handleCategoryChange}
                            isOptionEqualToValue={(opt, val) => opt.id === val.id}
                            renderInput={(params) => <TextField {...params} label="Subject" placeholder="Search subject..." />}
                            sx={{ minWidth: 200 }}
                        />
                        <Autocomplete
                            size="small"
                            options={writers || []}
                            getOptionLabel={(opt) => opt.name}
                            value={writerValue}
                            onChange={handleWriterChange}
                            isOptionEqualToValue={(opt, val) => opt.id === val.id}
                            renderInput={(params) => <TextField {...params} label="Writer" placeholder="Search writer..." />}
                            sx={{ minWidth: 200 }}
                        />
                        <Stack direction="row" spacing={1}>
                            <Button type="submit" variant="contained" size="small">Search</Button>
                            {hasActiveFilters && (
                                <Button variant="outlined" size="small" onClick={handleClear}>Clear</Button>
                            )}
                        </Stack>
                    </Stack>
                </Box>

                {articles.data.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <ArticleIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                        <Typography color="text.secondary">
                            No published articles yet. Check back later!
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
                        {sortedArticles.map((article) => (
                            <Box key={article.id}>
                                <Card
                                    elevation={2}
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: '.2s',
                                        '&:hover': { elevation: 6, transform: 'translateY(-2px)' },
                                        ...(bookmarkSet.has(article.id) && {
                                            borderTop: 3,
                                            borderColor: 'primary.main',
                                        }),
                                    }}
                                >
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                                            <Chip
                                                label={article.category?.name}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                            />
                                            <IconButton
                                                size="small"
                                                onClick={() => router.post(route('articles.bookmark', article.id), {}, { preserveScroll: true })}
                                                sx={{ ml: 1, mt: -0.5 }}
                                                title={bookmarkSet.has(article.id) ? 'Remove bookmark' : 'Bookmark this article'}
                                            >
                                                {bookmarkSet.has(article.id) ? (
                                                    <BookmarkIcon color="primary" />
                                                ) : (
                                                    <BookmarkBorderIcon color="action" />
                                                )}
                                            </IconButton>
                                        </Stack>
                                        <Typography variant="h6" component="h2" gutterBottom sx={{ lineHeight: 1.4 }}>
                                            {article.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            By {article.writer?.name} &bull;{' '}
                                            {new Date(article.updated_at).toLocaleDateString()}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                mt: 1,
                                                display: '-webkit-box',
                                                WebkitLineClamp: 3,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                            }}
                                            dangerouslySetInnerHTML={{
                                                __html: article.content?.replace(/<[^>]+>/g, '').slice(0, 150) + '...',
                                            }}
                                        />
                                    </CardContent>
                                    <CardActions sx={{ px: 2, pb: 2, justifyContent: 'space-between' }}>
                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                            {article.reviews_avg_rating ? (
                                                <Stack direction="row" spacing={0.5} alignItems="center">
                                                    <Rating value={parseFloat(article.reviews_avg_rating)} precision={0.1} readOnly size="small" />
                                                    <Typography variant="caption" color="text.secondary">
                                                        ({article.reviews_count})
                                                    </Typography>
                                                </Stack>
                                            ) : (
                                                <Typography variant="caption" color="text.secondary">
                                                    No reviews
                                                </Typography>
                                            )}
                                            <Stack direction="row" spacing={0.5} alignItems="center">
                                                <CommentIcon fontSize="small" color="action" />
                                                <Typography variant="caption" color="text.secondary">
                                                    {article.comments?.length ?? 0}
                                                </Typography>
                                            </Stack>
                                        </Stack>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            component={Link}
                                            href={route('student.show', article.id)}
                                        >
                                            Read More
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Box>
                        ))}
                    </Box>
                )}

                {/* Pagination */}
                {articles.last_page > 1 && (
                    <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 4 }}>
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

            </Container>
        </AuthenticatedLayout>
    );
}
