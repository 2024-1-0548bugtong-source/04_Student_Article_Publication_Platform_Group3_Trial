<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Technology',
                'slug' => 'technology',
                'description' => 'Articles about technology and software development',
            ],
            [
                'name' => 'Business',
                'slug' => 'business',
                'description' => 'Business and entrepreneurship articles',
            ],
            [
                'name' => 'Education',
                'slug' => 'education',
                'description' => 'Educational content and learning resources',
            ],
            [
                'name' => 'Science',
                'slug' => 'science',
                'description' => 'Scientific research and discoveries',
            ],
            [
                'name' => 'Health',
                'slug' => 'health',
                'description' => 'Health and wellness articles',
            ],
            [
                'name' => 'Mathematics',
                'slug' => 'mathematics',
                'description' => 'Mathematics, statistics, and quantitative analysis',
            ],
            [
                'name' => 'Engineering',
                'slug' => 'engineering',
                'description' => 'Engineering disciplines and innovation',
            ],
            [
                'name' => 'Arts & Literature',
                'slug' => 'arts-literature',
                'description' => 'Creative arts, literature, and humanities',
            ],
            [
                'name' => 'Social Sciences',
                'slug' => 'social-sciences',
                'description' => 'Psychology, sociology, and political science',
            ],
            [
                'name' => 'Environmental Studies',
                'slug' => 'environmental-studies',
                'description' => 'Climate, ecology, and sustainability',
            ],
            [
                'name' => 'History',
                'slug' => 'history',
                'description' => 'Historical events, analysis, and perspectives',
            ],
            [
                'name' => 'Sports',
                'slug' => 'sports',
                'description' => 'Sports news, analysis, and athletics',
            ],
            [
                'name' => 'Philosophy',
                'slug' => 'philosophy',
                'description' => 'Philosophical thought and ethics',
            ],
            [
                'name' => 'Law & Politics',
                'slug' => 'law-politics',
                'description' => 'Legal studies, governance, and public policy',
            ],
            [
                'name' => 'Computer Science',
                'slug' => 'computer-science',
                'description' => 'Algorithms, data structures, and computing theory',
            ],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['slug' => $category['slug']],
                $category
            );
        }
    }
}
