<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\ArticleStatus;
use App\Models\Category;
use App\Models\Comment;
use App\Models\Revision;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     *
     * Order matters to avoid foreign key errors:
     * 1. RoleSeeder        — creates roles & permissions (no FK dependencies)
     * 2. ArticleStatusSeeder — creates statuses (no FK dependencies)
     * 3. CategorySeeder    — creates categories (no FK dependencies)
     * 4. UserSeeder        — creates users and assigns roles (depends on roles)
     * 5. Sample data       — articles, revisions, comments (depends on all above)
     *
     * Seeded Accounts (password: "password"):
     * +----------------------+------------------+----------+
     * | Email                | Name             | Role     |
     * +----------------------+------------------+----------+
     * | writer@example.com   | John Writer      | writer   |
     * | editor@example.com   | Jane Editor      | editor   |
     * | student@example.com  | Bob Student      | student  |
     * +----------------------+------------------+----------+
     */
    public function run(): void
    {
        // 1. Seed roles & permissions
        $this->call(RoleSeeder::class);

        // 2. Seed article statuses (Draft, Submitted, Needs Revision, Published, Commented)
        $this->call(ArticleStatusSeeder::class);

        // 3. Seed categories (Technology, Business, Education, Science, Health)
        $this->call(CategorySeeder::class);

        // 4. Seed users with roles
        $this->call(UserSeeder::class);

        // 5. Generate sample articles, revisions, and comments
        $this->generateSampleData();
    }

    /**
     * Generate sample articles across various statuses,
     * with revisions and comments for realistic test data.
     */
    private function generateSampleData(): void
    {
        $writer = User::where('email', 'writer@example.com')->first();
        $editor = User::where('email', 'editor@example.com')->first();
        $student = User::where('email', 'student@example.com')->first();

        $categories = Category::all();
        $draftStatus = ArticleStatus::where('name', 'Draft')->first();
        $submittedStatus = ArticleStatus::where('name', 'Submitted')->first();
        $needsRevisionStatus = ArticleStatus::where('name', 'Needs Revision')->first();
        $publishedStatus = ArticleStatus::where('name', 'Published')->first();

        // --- Draft articles (writer has drafts in progress) ---
        Article::factory()->count(2)->create([
            'writer_id' => $writer->id,
            'category_id' => $categories->random()->id,
            'status_id' => $draftStatus->id,
        ]);

        // --- Submitted articles (waiting for editor review) ---
        $submittedArticles = Article::factory()->count(2)->create([
            'writer_id' => $writer->id,
            'category_id' => $categories->random()->id,
            'status_id' => $submittedStatus->id,
        ]);

        // --- Articles needing revision (editor requested changes) ---
        $revisionArticles = Article::factory()->count(2)->create([
            'writer_id' => $writer->id,
            'category_id' => $categories->random()->id,
            'status_id' => $needsRevisionStatus->id,
        ]);

        // Add revision feedback from editor
        foreach ($revisionArticles as $article) {
            Revision::factory()->count(rand(1, 3))->create([
                'article_id' => $article->id,
                'editor_id' => $editor->id,
            ]);
        }

        // --- Published articles (visible to students) ---
        $publishedArticles = Article::factory()->count(4)->create([
            'writer_id' => $writer->id,
            'editor_id' => $editor->id,
            'category_id' => $categories->random()->id,
            'status_id' => $publishedStatus->id,
        ]);

        // Add comments from student on published articles
        foreach ($publishedArticles as $article) {
            Comment::factory()->count(rand(1, 4))->create([
                'article_id' => $article->id,
                'student_id' => $student->id,
            ]);
        }

        // Add revision history for some published articles
        foreach ($publishedArticles->take(2) as $article) {
            Revision::factory()->count(rand(1, 2))->create([
                'article_id' => $article->id,
                'editor_id' => $editor->id,
            ]);
        }
    }
}
