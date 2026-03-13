<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => 'required|in:writer,editor,student',
        ]);

        // Students are auto-approved; writers and editors need admin approval
        $needsApproval = in_array($request->role, ['writer', 'editor']);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'is_approved' => !$needsApproval,
        ]);

        $user->assignRole($request->role);

        event(new Registered($user));

        if ($needsApproval) {
            return redirect()->route('login')
                ->with('status', 'Your account has been created and is pending admin approval. You will be able to log in once an administrator approves your account.');
        }

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}
