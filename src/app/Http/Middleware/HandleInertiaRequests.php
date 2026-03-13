<?php

namespace App\Http\Middleware;

use App\Models\WriterApplication;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? array_merge(
                    $user->only('id', 'name', 'email'),
                    ['roles' => $user->getRoleNames()->toArray()]
                ) : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
            ],
            'writerApplication' => fn () => $user && $user->hasRole('student')
                ? WriterApplication::where('user_id', $user->id)->latest()->first(['id', 'status'])
                : null,
        ];
    }
}
