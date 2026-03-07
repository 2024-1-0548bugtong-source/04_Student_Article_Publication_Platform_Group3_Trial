<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\WriterApplication;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    /**
     * Show admin dashboard with pending and approved accounts.
     */
    public function dashboard(): Response
    {
        $pendingUsers = User::where('is_approved', false)
            ->with('roles')
            ->latest()
            ->paginate(10, ['*'], 'pending_page');

        $approvedUsers = User::where('is_approved', true)
            ->whereHas('roles', fn ($q) => $q->whereIn('name', ['writer', 'editor']))
            ->with('roles')
            ->latest()
            ->paginate(10, ['*'], 'approved_page');

        $writerApplications = WriterApplication::where('status', 'pending')
            ->with('user')
            ->latest()
            ->paginate(10, ['*'], 'applications_page');

        return Inertia::render('Admin/Dashboard', [
            'pendingUsers' => $pendingUsers,
            'approvedUsers' => $approvedUsers,
            'writerApplications' => $writerApplications,
        ]);
    }

    /**
     * Approve a user account.
     */
    public function approve(User $user): RedirectResponse
    {
        $user->update(['is_approved' => true]);

        return redirect()->route('admin.dashboard')
            ->with('success', $user->name . ' has been approved.');
    }

    /**
     * Reject (delete) a pending user account.
     */
    public function reject(User $user): RedirectResponse
    {
        $name = $user->name;
        $user->delete();

        return redirect()->route('admin.dashboard')
            ->with('success', $name . '\'s account has been rejected and removed.');
    }

    /**
     * Approve a student's writer application — grant them the writer role.
     */
    public function approveWriterApplication(WriterApplication $application): RedirectResponse
    {
        $application->update(['status' => 'approved']);
        $application->user->assignRole('writer');

        return redirect()->route('admin.dashboard')
            ->with('success', $application->user->name . ' has been approved as a writer.');
    }

    /**
     * Reject a student's writer application.
     */
    public function rejectWriterApplication(WriterApplication $application): RedirectResponse
    {
        $application->update(['status' => 'rejected']);

        return redirect()->route('admin.dashboard')
            ->with('success', $application->user->name . '\'s writer application has been rejected.');
    }
}
