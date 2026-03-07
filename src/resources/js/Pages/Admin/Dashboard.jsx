import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Chip,
    Container,
    Paper,
    Stack,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import { useState } from 'react';

export default function AdminDashboard({ pendingUsers, approvedUsers, writerApplications }) {
    const { flash } = usePage().props;
    const [tab, setTab] = useState(0);

    const handleApprove = (userId) => {
        router.post(route('admin.approve', userId));
    };

    const handleReject = (userId) => {
        if (confirm('Are you sure you want to reject and remove this account?')) {
            router.delete(route('admin.reject', userId));
        }
    };

    const handleApproveWriterApp = (applicationId) => {
        router.post(route('admin.approve-writer-application', applicationId));
    };

    const handleRejectWriterApp = (applicationId) => {
        if (confirm('Are you sure you want to reject this writer application?')) {
            router.post(route('admin.reject-writer-application', applicationId));
        }
    };

    return (
        <AuthenticatedLayout
            header={<Typography variant="h6">Admin Dashboard</Typography>}
        >
            <Head title="Admin Dashboard" />
            <Container maxWidth="lg" sx={{ py: 4 }}>

                {flash?.success && (
                    <Alert severity="success" sx={{ mb: 2 }}>{flash.success}</Alert>
                )}

                <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
                    Account Management
                </Typography>

                <Paper elevation={2}>
                    <Tabs
                        value={tab}
                        onChange={(_, v) => setTab(v)}
                        sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
                    >
                        <Tab
                            label={
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <span>Pending Approval</span>
                                    <Chip
                                        label={pendingUsers.total}
                                        size="small"
                                        color="warning"
                                    />
                                </Stack>
                            }
                        />
                        <Tab
                            label={
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <span>Approved Accounts</span>
                                    <Chip
                                        label={approvedUsers.total}
                                        size="small"
                                        color="success"
                                    />
                                </Stack>
                            }
                        />
                        <Tab
                            label={
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <span>Writer Applications</span>
                                    <Chip
                                        label={writerApplications?.total ?? 0}
                                        size="small"
                                        color="info"
                                    />
                                </Stack>
                            }
                        />
                    </Tabs>

                    {/* Pending Users */}
                    {tab === 0 && (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>Name</strong></TableCell>
                                        <TableCell><strong>Email</strong></TableCell>
                                        <TableCell><strong>Role</strong></TableCell>
                                        <TableCell><strong>Registered</strong></TableCell>
                                        <TableCell align="right"><strong>Actions</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {pendingUsers.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                                                <Typography color="text.secondary">
                                                    No pending accounts to review.
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : pendingUsers.data.map((user) => (
                                        <TableRow key={user.id} hover>
                                            <TableCell>
                                                <Stack direction="row" spacing={1.5} alignItems="center">
                                                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>
                                                        {user.name?.[0]?.toUpperCase()}
                                                    </Avatar>
                                                    <Typography fontWeight="medium">{user.name}</Typography>
                                                </Stack>
                                            </TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={user.roles?.[0]?.name ?? 'Unknown'}
                                                    size="small"
                                                    color={user.roles?.[0]?.name === 'editor' ? 'primary' : 'secondary'}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                    <Button
                                                        variant="contained"
                                                        color="success"
                                                        size="small"
                                                        startIcon={<CheckCircleIcon />}
                                                        onClick={() => handleApprove(user.id)}
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        color="error"
                                                        size="small"
                                                        startIcon={<CancelIcon />}
                                                        onClick={() => handleReject(user.id)}
                                                    >
                                                        Reject
                                                    </Button>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {/* Approved Users */}
                    {tab === 1 && (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>Name</strong></TableCell>
                                        <TableCell><strong>Email</strong></TableCell>
                                        <TableCell><strong>Role</strong></TableCell>
                                        <TableCell><strong>Registered</strong></TableCell>
                                        <TableCell><strong>Status</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {approvedUsers.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                                                <Typography color="text.secondary">
                                                    No approved writer/editor accounts yet.
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : approvedUsers.data.map((user) => (
                                        <TableRow key={user.id} hover>
                                            <TableCell>
                                                <Stack direction="row" spacing={1.5} alignItems="center">
                                                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>
                                                        {user.name?.[0]?.toUpperCase()}
                                                    </Avatar>
                                                    <Typography fontWeight="medium">{user.name}</Typography>
                                                </Stack>
                                            </TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={user.roles?.[0]?.name ?? 'Unknown'}
                                                    size="small"
                                                    color={user.roles?.[0]?.name === 'editor' ? 'primary' : 'secondary'}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <Chip label="Approved" size="small" color="success" />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {/* Writer Applications */}
                    {tab === 2 && (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>Student</strong></TableCell>
                                        <TableCell><strong>Email</strong></TableCell>
                                        <TableCell><strong>Reason</strong></TableCell>
                                        <TableCell><strong>Applied</strong></TableCell>
                                        <TableCell align="right"><strong>Actions</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(!writerApplications || writerApplications.data.length === 0) ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                                                <Typography color="text.secondary">
                                                    No pending writer applications.
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : writerApplications.data.map((app) => (
                                        <TableRow key={app.id} hover>
                                            <TableCell>
                                                <Stack direction="row" spacing={1.5} alignItems="center">
                                                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'info.main', fontSize: 14 }}>
                                                        {app.user?.name?.[0]?.toUpperCase()}
                                                    </Avatar>
                                                    <Stack>
                                                        <Typography fontWeight="medium">{app.user?.name}</Typography>
                                                        <Chip label="Student" size="small" color="default" sx={{ width: 'fit-content' }} />
                                                    </Stack>
                                                </Stack>
                                            </TableCell>
                                            <TableCell>{app.user?.email}</TableCell>
                                            <TableCell sx={{ maxWidth: 300 }}>
                                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                                    {app.reason}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(app.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                    <Button
                                                        variant="contained"
                                                        color="success"
                                                        size="small"
                                                        startIcon={<CheckCircleIcon />}
                                                        onClick={() => handleApproveWriterApp(app.id)}
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        color="error"
                                                        size="small"
                                                        startIcon={<CancelIcon />}
                                                        onClick={() => handleRejectWriterApp(app.id)}
                                                    >
                                                        Reject
                                                    </Button>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>

                {/* Pagination */}
                {tab === 0 && pendingUsers.last_page > 1 && (
                    <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 3 }}>
                        {pendingUsers.links.map((link, i) => (
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
                {tab === 1 && approvedUsers.last_page > 1 && (
                    <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 3 }}>
                        {approvedUsers.links.map((link, i) => (
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
                {tab === 2 && writerApplications?.last_page > 1 && (
                    <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 3 }}>
                        {writerApplications.links.map((link, i) => (
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
