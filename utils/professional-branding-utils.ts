// utils/professional-branding-utils.ts

// Client-side utility functions
export function isTaskCompleted(userProgress: any[], taskId: string): boolean {
  return userProgress.some(progress => 
    progress.taskId === taskId && progress.completed
  );
}

export function calculateProgressStats(completed: number, total: number) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  return {
    completed,
    total,
    percentage
  };
}

export function groupTasksByCategory(tasks: any[]) {
  return tasks.reduce((acc: any, task) => {
    if (!acc[task.category]) {
      acc[task.category] = [];
    }
    acc[task.category].push(task);
    return acc;
  }, {});
}

export const categoryNames = {
  linkedin: 'LinkedIn Profile',
  github: 'GitHub Portfolio', 
  leetcode: 'Coding Practice',
  internship: 'Internship Prep',
  resume: 'Resume Building'
};

export const categoryIcons = {
  linkedin: '💼',
  github: '💻',
  leetcode: '⚡',
  internship: '🎯',
  resume: '📄'
};

export const categoryColors = {
  linkedin: 'bg-blue-100 border-blue-300',
  github: 'bg-gray-100 border-gray-300',
  leetcode: 'bg-yellow-100 border-yellow-300',
  internship: 'bg-green-100 border-green-300',
  resume: 'bg-purple-100 border-purple-300'
};

export const motivationalQuotes = [
  "Your professional brand is your promise to the world. Keep building!",
  "Small steps every day lead to big career opportunities.",
  "Your online presence is your digital handshake. Make it count!",
  "Consistency is the key to building a strong professional brand.",
  "Every task you complete brings you closer to your dream career."
];