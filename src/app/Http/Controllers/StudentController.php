<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\ArticleStatus;
use App\Models\Bookmark;
use App\Models\Category;
use App\Models\Comment;
use App\Models\Review;
use App\Models\User;
use App\Models\WriterApplication;
use App\Notifications\CommentPostedNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    /**
     * Show student dashboard with published articles
     */
    public function dashboard(Request $request): Response
    {
        $publishedStatus = ArticleStatus::where('name', 'Published')->first();

        $query = Article::where('status_id', $publishedStatus->id)
            ->with(['writer', 'category', 'comments' => function ($query) {
                $query->latest();
            }])
            ->withAvg('reviews', 'rating')
            ->withCount('reviews');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', '%' . $search . '%')
                  ->orWhere('content', 'like', '%' . $search . '%')
                  ->orWhereHas('writer', fn ($w) => $w->where('name', 'like', '%' . $search . '%'))
                  ->orWhereHas('category', fn ($c) => $c->where('name', 'like', '%' . $search . '%'));
            });
        }

        if ($categoryId = $request->input('category')) {
            $query->where('category_id', $categoryId);
        }

        if ($writerId = $request->input('writer')) {
            $query->where('writer_id', $writerId);
        }

        $articles = $query->latest()->paginate(10)->withQueryString();

        // Popular articles: top 5 by average rating (must have at least 1 review)
        $popularArticles = Article::where('status_id', $publishedStatus->id)
            ->with(['writer', 'category'])
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->having('reviews_count', '>', 0)
            ->orderByDesc('reviews_avg_rating')
            ->limit(5)
            ->get();

        // Filter options
        $categories = Category::orderBy('name')->get(['id', 'name']);
        $writers = User::role('writer')
            ->whereHas('writtenArticles', fn ($q) => $q->where('status_id', $publishedStatus->id))
            ->orderBy('name')
            ->get(['id', 'name']);

        // Bookmarked article IDs for the current user
        $bookmarkedIds = Bookmark::where('user_id', Auth::id())->pluck('article_id')->toArray();

        return Inertia::render('Student/Dashboard', [
            'articles' => $articles,
            'popularArticles' => $popularArticles,
            'categories' => $categories,
            'writers' => $writers,
            'filters' => [
                'search' => $search ?? '',
                'category' => $request->input('category', ''),
                'writer' => $request->input('writer', ''),
            ],
            'writerApplication' => WriterApplication::where('user_id', Auth::id())->latest()->first(),
            'isAlsoWriter' => Auth::user()->hasRole('writer'),
            'bookmarkedIds' => $bookmarkedIds,
        ]);
    }

    /**
     * Show individual article with comments
     */
    public function show(Article $article): Response
    {
        if (!$article->isPublished()) {
            abort(403, 'This article is not available for viewing.');
        }

        return Inertia::render('Student/ArticleDetail', [
            'article' => $article->load(['writer', 'category', 'comments' => function ($query) {
                $query->with('student')->latest();
            }, 'reviews' => function ($query) {
                $query->with('student')->latest();
            }]),
            'userReview' => $article->reviews()->where('student_id', Auth::id())->first(),
        ]);
    }

    /**
     * Store a new comment
     */
    public function storeComment(Request $request, Article $article): RedirectResponse
    {
        $this->authorize('create', [Comment::class, $article]);

        $validated = $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        $comment = Comment::create([
            'article_id' => $article->id,
            'student_id' => Auth::id(),
            'content' => $validated['content'],
        ]);

        $article->writer->notify(new CommentPostedNotification($comment->load(['article', 'student'])));

        return redirect()->route('student.show', $article)->with('success', 'Comment posted successfully.');
    }

    /**
     * Delete a comment
     */
    public function deleteComment(Comment $comment): RedirectResponse
    {
        $this->authorize('delete', $comment);

        $articleId = $comment->article_id;
        $comment->delete();

        return redirect()->route('student.show', $articleId)->with('success', 'Comment deleted successfully.');
    }

    /**
     * Store or update a review
     */
    public function storeReview(Request $request, Article $article): RedirectResponse
    {
        $this->authorize('create', [Review::class, $article]);

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'body' => 'nullable|string|max:1000',
        ]);

        Review::updateOrCreate(
            ['article_id' => $article->id, 'student_id' => Auth::id()],
            ['rating' => $validated['rating'], 'body' => $validated['body'] ?? null],
        );

        return redirect()->route('student.show', $article)->with('success', 'Review submitted successfully.');
    }

    /**
     * Delete own review
     */
    public function deleteReview(Review $review): RedirectResponse
    {
        $this->authorize('delete', $review);

        $articleId = $review->article_id;
        $review->delete();

        return redirect()->route('student.show', $articleId)->with('success', 'Review deleted successfully.');
    }

    /**
     * Apply to become a writer
     */
    public function applyForWriter(Request $request): RedirectResponse
    {
        $user = Auth::user();

        if ($user->hasRole('writer')) {
            return redirect()->route('student.dashboard')->with('error', 'You already have a writer account.');
        }

        $existing = WriterApplication::where('user_id', $user->id)
            ->where('status', 'pending')
            ->first();

        if ($existing) {
            return redirect()->route('student.dashboard')->with('error', 'You already have a pending application.');
        }

        $validated = $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        WriterApplication::create([
            'user_id' => $user->id,
            'reason' => $validated['reason'],
            'status' => 'pending',
        ]);

        return redirect()->route('student.dashboard')->with('success', 'Your writer application has been submitted! An admin will review it shortly.');
    }

    /**
     * Toggle bookmark for an article
     */
    public function toggleBookmark(Article $article): RedirectResponse
    {
        $userId = Auth::id();
        $existing = Bookmark::where('user_id', $userId)->where('article_id', $article->id)->first();

        if ($existing) {
            $existing->delete();
            return redirect()->back()->with('success', 'Bookmark removed.');
        }

        Bookmark::create(['user_id' => $userId, 'article_id' => $article->id]);
        return redirect()->back()->with('success', 'Article bookmarked.');
    }
}
