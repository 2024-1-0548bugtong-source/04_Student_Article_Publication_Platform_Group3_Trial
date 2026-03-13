import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Avatar,
    Box,
    Button,
    Chip,
    Container,
    Divider,
    Paper,
    Rating,
    Stack,
    Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarIcon from '@mui/icons-material/Star';

export default function ArticleView({ article }) {
    const reviews = article.reviews || [];
    const comments = article.comments || [];
    const avgRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length)
        : 0;

    return (
        <AuthenticatedLayout
            header={<Typography variant="h6">Article Feedback</Typography>}
        >
            <Head title={article.title} />
            <Container maxWidth="md" sx={{ py: 4 }}>

                <Button
                    variant="text"
                    startIcon={<ArrowBackIcon />}
                    component={Link}
                    href={route('writer.dashboard')}
                    sx={{ mb: 2 }}
                >
                    Back to Dashboard
                </Button>

                {/* Article Header */}
                <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                        <Chip label={article.category?.name} size="small" color="primary" variant="outlined" />
                        <Chip label={article.status?.name} size="small" color="success" />
                    </Stack>

                    <Typography variant="h3" component="h1" gutterBottom sx={{ lineHeight: 1.3 }}>
                        {article.title}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Published {new Date(article.updated_at).toLocaleDateString()}
                    </Typography>

                    {reviews.length > 0 && (
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                            <Rating value={avgRating} precision={0.1} readOnly size="small" />
                            <Typography variant="body2" color="text.secondary">
                                {avgRating.toFixed(1)} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                            </Typography>
                        </Stack>
                    )}

                    <Divider sx={{ mb: 3 }} />

                    <Typography
                        variant="body1"
                        component="div"
                        dangerouslySetInnerHTML={{ __html: article.content }}
                        sx={{ lineHeight: 1.9, '& img': { maxWidth: '100%' } }}
                    />
                </Paper>

                {/* Reviews Section */}
                <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                        <StarIcon color="warning" />
                        <Typography variant="h5">
                            Reviews ({reviews.length})
                        </Typography>
                    </Stack>
                    {reviews.length > 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Average rating: {avgRating.toFixed(1)} / 5
                        </Typography>
                    )}
                    <Divider sx={{ mb: 3 }} />

                    {reviews.length === 0 ? (
                        <Typography color="text.secondary">
                            No reviews yet.
                        </Typography>
                    ) : (
                        <Stack spacing={2}>
                            {reviews.map((review) => (
                                <Box key={review.id}>
                                    <Stack direction="row" spacing={2} alignItems="flex-start">
                                        <Avatar sx={{ width: 36, height: 36, bgcolor: 'warning.main', fontSize: 14 }}>
                                            {review.student?.name?.[0]?.toUpperCase()}
                                        </Avatar>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="subtitle2">
                                                {review.student?.name}
                                                <Typography
                                                    component="span"
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{ ml: 1 }}
                                                >
                                                    {new Date(review.created_at).toLocaleDateString()}
                                                </Typography>
                                            </Typography>
                                            <Rating value={review.rating} readOnly size="small" sx={{ mt: 0.5 }} />
                                            {review.body && (
                                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                                    {review.body}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Stack>
                                    <Divider sx={{ mt: 2 }} />
                                </Box>
                            ))}
                        </Stack>
                    )}
                </Paper>

                {/* Comments Section */}
                <Paper elevation={2} sx={{ p: 3 }}>
                    <Typography variant="h5" gutterBottom>
                        Comments ({comments.length})
                    </Typography>
                    <Divider sx={{ mb: 3 }} />

                    {comments.length === 0 ? (
                        <Typography color="text.secondary">
                            No comments yet.
                        </Typography>
                    ) : (
                        <Stack spacing={2}>
                            {comments.map((comment) => (
                                <Box key={comment.id}>
                                    <Stack direction="row" spacing={2} alignItems="flex-start">
                                        <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 14 }}>
                                            {comment.student?.name?.[0]?.toUpperCase()}
                                        </Avatar>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="subtitle2">
                                                {comment.student?.name}
                                                <Typography
                                                    component="span"
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{ ml: 1 }}
                                                >
                                                    {new Date(comment.created_at).toLocaleDateString()}
                                                </Typography>
                                            </Typography>
                                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                                                {comment.content}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                    <Divider sx={{ mt: 2 }} />
                                </Box>
                            ))}
                        </Stack>
                    )}
                </Paper>

            </Container>
        </AuthenticatedLayout>
    );
}
