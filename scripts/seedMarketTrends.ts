import { connectDB } from '@/lib/db'; // Changed from connectToDatabase
import MarketTrends from '@/models/MarketTrend';

async function seedMarketTrends() {
  try {
    await connectDB(); // Changed from connectToDatabase

    // Clear existing data
    await MarketTrends.deleteMany({});

    const sampleData = {
      month: "January 2024",
      trendingSkills: [
        { skill: "Artificial Intelligence", demandScore: 95 },
        { skill: "Machine Learning", demandScore: 92 },
        { skill: "Cloud Computing", demandScore: 90 },
        { skill: "Data Science", demandScore: 87 },
        { skill: "Cybersecurity", demandScore: 88 },
        { skill: "DevOps", demandScore: 85 },
        { skill: "Full Stack Development", demandScore: 83 },
        { skill: "Blockchain", demandScore: 82 }
      ],
      hiringDomains: [
        { domain: "Machine Learning Engineer", openings: 12500 },
        { domain: "Full Stack Developer", openings: 15000 },
        { domain: "Data Scientist", openings: 11500 },
        { domain: "Cloud Architect", openings: 9800 },
        { domain: "DevOps Engineer", openings: 10500 },
        { domain: "Cybersecurity Analyst", openings: 9200 }
      ],
      salaryComparison: [
        { role: "ML Engineer", india: 18, abroad: 150 },
        { role: "Full Stack Developer", india: 12, abroad: 110 },
        { role: "Data Scientist", india: 15, abroad: 130 },
        { role: "Cloud Engineer", india: 14, abroad: 125 },
        { role: "DevOps Engineer", india: 16, abroad: 140 }
      ],
      hotArticles: [
        {
          title: "AI Revolution: How Machine Learning is Transforming Industries",
          url: "https://example.com/ai-revolution",
          summary: "Exploring the impact of AI across various sectors and future trends in machine learning applications."
        },
        {
          title: "Remote Work: The New Normal in Tech Industry",
          url: "https://example.com/remote-work-trends",
          summary: "How remote work is shaping hiring practices, team collaboration, and company culture in 2024."
        },
        {
          title: "The Rise of Edge Computing in Modern Applications",
          url: "https://example.com/edge-computing-rise",
          summary: "Understanding edge computing and its growing importance in tech infrastructure and IoT applications."
        }
      ],
      apiSource: "LinkedIn API + Glassdoor + Internal Analytics",
      internalAnalytics: {
        mostCompletedSkills: ["Python", "React", "Machine Learning"],
        popularResources: ["DSA Course", "Web Development Bootcamp"]
      }
    };

    await MarketTrends.create(sampleData);
    console.log('✅ Sample market trends data seeded successfully!');
    
    // Verify the data
    const count = await MarketTrends.countDocuments();
    console.log(`📊 Total market trends documents: ${count}`);
    
  } catch (error) {
    console.error('❌ Error seeding market trends:', error);
  } finally {
    process.exit();
  }
}

seedMarketTrends();