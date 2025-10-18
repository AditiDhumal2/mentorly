export const YEAR_DESCRIPTIONS = {
  1: {
    title: "Foundation Year - Programming Fundamentals",
    description: "Learn basic programming concepts, algorithms, and problem-solving skills. Master the fundamentals that will support your entire programming journey.",
    focus: "Basic syntax, data structures, algorithms, and logical thinking",
    icon: "🌱",
    color: "green",
    prerequisites: "No prior programming experience required"
  },
  2: {
    title: "Skill Development - Advanced Concepts", 
    description: "Dive deeper into programming concepts and build complex applications. Learn object-oriented programming, databases, and APIs.",
    focus: "OOP, databases, APIs, frameworks, and intermediate projects",
    icon: "🚀",
    color: "blue",
    prerequisites: "Complete Year 1 fundamentals or equivalent knowledge"
  },
  3: {
    title: "Specialization - Domain Expertise",
    description: "Focus on specific domains like web development, mobile apps, or data science. Build real-world projects and specialize in your area of interest.",
    focus: "Advanced frameworks, specialized tools, and real-world projects",
    icon: "🎯",
    color: "purple",
    prerequisites: "Strong grasp of Year 2 concepts"
  },
  4: {
    title: "Placement Preparation - Career Ready",
    description: "Prepare for interviews, build an impressive portfolio, and master advanced concepts. Get ready for your dream job in tech.",
    focus: "System design, interview prep, portfolio development, and soft skills",
    icon: "🏆",
    color: "orange",
    prerequisites: "Completion of Years 1-3 or equivalent experience"
  }
};

export const getYearLabel = (year: number) => {
  const labels: { [key: number]: string } = {
    1: '1st Year - Foundation',
    2: '2nd Year - Skill Development', 
    3: '3rd Year - Specialization',
    4: '4th Year - Placement Preparation'
  };
  return labels[year] || `Year ${year}`;
};