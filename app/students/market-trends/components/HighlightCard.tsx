interface Article {
  title: string;
  url: string;
  summary?: string;
}

interface HighlightCardProps {
  article: Article;
}

export default function HighlightCard({ article }: HighlightCardProps) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all group"
    >
      <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
        {article.title}
      </h3>
      {article.summary && (
        <p className="text-sm text-gray-600 line-clamp-3 mb-3">
          {article.summary}
        </p>
      )}
      <div className="flex items-center text-xs text-blue-600 font-medium">
        Read full article
        <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </div>
    </a>
  );
}