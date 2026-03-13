<?php

namespace App\Policies;

use App\Models\Article;
use App\Models\Review;
use App\Models\User;

class ReviewPolicy
{
    public function create(User $user, Article $article): bool
    {
        return $user->hasRole('student') && $article->isPublished();
    }

    public function delete(User $user, Review $review): bool
    {
        return $user->id === $review->student_id && $user->hasRole('student');
    }
}
