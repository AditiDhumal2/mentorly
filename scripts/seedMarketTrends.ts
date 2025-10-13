import { connectDB } from '../lib/db';
import { MarketTrend } from '../models/MarketTrend';

async function seedMarketTrends() {
  try {
    await connectDB();

    const marketTrendsData = {
      month: 'October 2024',
      trendingSkills: [
        { skill: 'React.js', demandScore: 95 },
        { skill: 'Node.js', demandScore: 88 },
        { skill: 'Python', demandScore: 92 },
        { skill: 'AWS', demandScore: 85 },
        { skill: 'Machine Learning', demandScore: 78 }
      ],
      hiringDomains: [
        { domain: 'Full Stack Development', openings: 1200 },
        { domain: 'Data Science', openings: 800 },
        { domain: 'DevOps', openings: 600 },
        { domain: 'Mobile Development', openings: 500 }
      ],
      salaryComparison: [
        { role: 'Frontend Developer', india: 8, abroad: 85 },
        { role: 'Backend Developer', india: 12, abroad: 100 },
        { role: 'Data Scientist', india: 15, abroad: 120 },
        { role: 'DevOps Engineer', india: 14, abroad: 110 }
      ],
      hotArticles: [
        {
          title: 'The Rise of AI in Software Development',
          url: 'https://example.com/ai-software-development',
          summary: 'How AI is transforming the way we build software'
        },
        {
          title: 'Remote Work: The New Normal',
          url: 'https://example.com/remote-work-trends',
          summary: 'Companies embracing permanent remote work policies'
        }
      ],
      apiSource: 'LinkedIn API + Internal Analytics',
      internalAnalytics: {
        mostCompletedSkills: ['JavaScript', 'Python', 'React'],
        popularResources: ['FreeCodeCamp', 'MDN Web Docs', 'Stack Overflow']
      }
    };

    await MarketTrend.create(marketTrendsData);
    console.log('Market trends seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding market trends:', error);
    process.exit(1);
  }
}

seedMarketTrends();