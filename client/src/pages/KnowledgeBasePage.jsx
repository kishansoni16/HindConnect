import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, 
  Search, 
  ThumbsUp, 
  Eye, 
  ArrowLeft,
  ChevronRight,
  HelpCircle,
  FileText
} from 'lucide-react';

export default function KnowledgeBasePage() {
  const { showAlert } = useAuth();
  
  // States
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [votedList, setVotedList] = useState([]); // tracks article IDs voted helpful in this session

  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = await api.getKbArticles({
        search: searchQuery,
        category: categoryFilter
      });
      setArticles(data);
    } catch (err) {
      showAlert('Failed to load knowledge articles: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, [categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadArticles();
  };

  const handleArticleClick = async (article) => {
    try {
      const detail = await api.getKbArticleById(article.id || article._id);
      setSelectedArticle(detail);
      
      // Update local views count in articles list
      setArticles(prev => prev.map(a => 
        (a.id === article.id || a._id === article._id) 
          ? { ...a, views: (a.views || 0) + 1 } 
          : a
      ));
    } catch (err) {
      showAlert('Failed to retrieve article details: ' + err.message, 'error');
    }
  };

  const handleHelpfulVote = async (e, articleId) => {
    e.stopPropagation();
    if (votedList.includes(articleId)) {
      showAlert('You have already marked this article as helpful.', 'info');
      return;
    }

    try {
      const result = await api.voteHelpful(articleId);
      
      // Update states
      setVotedList(prev => [...prev, articleId]);
      if (selectedArticle && (selectedArticle.id === articleId || selectedArticle._id === articleId)) {
        setSelectedArticle(prev => ({ ...prev, helpfulVotes: result.helpfulVotes }));
      }
      setArticles(prev => prev.map(a => 
        (a.id === articleId || a._id === articleId) 
          ? { ...a, helpfulVotes: result.helpfulVotes } 
          : a
      ));
      
      showAlert('Thank you for your feedback!', 'success');
    } catch (err) {
      showAlert('Vote submission failed: ' + err.message, 'error');
    }
  };

  const categories = ['Network', 'Access & Security', 'Hardware', 'Software'];

  return (
    <div className="space-y-6">
      {/* Detail View Mode */}
      {selectedArticle ? (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Back Action */}
          <button
            onClick={() => setSelectedArticle(null)}
            className="flex items-center space-x-2 text-xs font-semibold text-corporate-textMuted hover:text-corporate-blue transition-colors border border-corporate-grayBorder bg-white px-3 py-1.5 rounded-xl shadow-sm self-start"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Documentation Library</span>
          </button>

          {/* Article Sheet */}
          <article className="bg-white border border-corporate-grayBorder rounded-2xl p-6 sm:p-10 shadow-sm space-y-6">
            
            {/* Header */}
            <div className="border-b border-slate-100 pb-5 space-y-3">
              <span className="inline-block text-[10px] font-extrabold uppercase px-2.5 py-0.5 bg-corporate-blueSoft text-corporate-blue rounded border border-corporate-blueSoft/30">
                {selectedArticle.category}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-corporate-blue leading-tight">
                {selectedArticle.title}
              </h1>
              <div className="flex items-center space-x-4 text-xs text-slate-500 font-medium pt-1">
                <span className="flex items-center space-x-1">
                  <Eye className="w-4 h-4 text-slate-400" />
                  <span>{selectedArticle.views} Views</span>
                </span>
                <span className="flex items-center space-x-1">
                  <ThumbsUp className="w-4 h-4 text-slate-400" />
                  <span>{selectedArticle.helpfulVotes} Helpful Votes</span>
                </span>
              </div>
            </div>

            {/* Main content body - Render standard styled markdown */}
            <div className="prose prose-sm prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4">
              {/* Quick parser to display markdown titles & bulletins nicely */}
              {selectedArticle.content.split('\n').map((line, idx) => {
                if (line.startsWith('### ')) {
                  return <h3 key={idx} className="text-base font-bold text-corporate-blue pt-4 pb-1 border-b border-slate-50">{line.replace('### ', '')}</h3>;
                }
                if (line.startsWith('#### ')) {
                  return <h4 key={idx} className="text-sm font-bold text-corporate-blue pt-2">{line.replace('#### ', '')}</h4>;
                }
                if (line.startsWith('* ') || line.startsWith('- ')) {
                  return (
                    <ul key={idx} className="list-disc pl-5 space-y-1 my-1">
                      <li>{line.substring(2)}</li>
                    </ul>
                  );
                }
                if (line.match(/^\d+\./)) {
                  return (
                    <ol key={idx} className="list-decimal pl-5 space-y-1 my-1">
                      <li>{line.replace(/^\d+\.\s*/, '')}</li>
                    </ol>
                  );
                }
                if (line.startsWith('`') || line.includes('`')) {
                  // highlight inline code
                  return (
                    <p key={idx} className="bg-slate-50 border border-slate-100 font-mono text-[11px] p-3 rounded-lg leading-relaxed my-2 whitespace-pre-wrap">
                      {line.replace(/`/g, '')}
                    </p>
                  );
                }
                return line.trim() === '' ? <div key={idx} className="h-2"></div> : <p key={idx}>{line}</p>;
              })}
            </div>

            {/* Helpful rating footer */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 p-4 rounded-xl">
              <span className="text-xs font-semibold text-slate-600 flex items-center">
                <HelpCircle className="w-4 h-4 mr-1.5 text-corporate-orange" />
                <span>Was this knowledge base article helpful?</span>
              </span>
              <button
                type="button"
                onClick={(e) => handleHelpfulVote(e, selectedArticle.id || selectedArticle._id)}
                className={`flex items-center space-x-1.5 px-4 py-2 border rounded-xl text-xs font-bold transition-all shadow-sm ${
                  votedList.includes(selectedArticle.id || selectedArticle._id)
                    ? 'bg-green-50 text-green-700 border-green-200 cursor-not-allowed'
                    : 'bg-white text-slate-700 border-corporate-grayBorder hover:bg-slate-50'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{votedList.includes(selectedArticle.id || selectedArticle._id) ? 'Marked Helpful' : 'Yes, Helpful'}</span>
              </button>
            </div>

          </article>
        </div>
      ) : (
        /* Articles List Mode */
        <div className="space-y-6">
          {/* Header Title */}
          <div>
            <h2 className="text-xl font-extrabold text-corporate-blue tracking-tight">Knowledge Base</h2>
            <p className="text-xs text-corporate-textMuted mt-0.5">Explore guides, troubleshooting documentation, and system manuals.</p>
          </div>

          {/* Search and Category Filter panel */}
          <div className="bg-white border border-corporate-grayBorder rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            
            <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center space-x-2">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <Search className="w-4 h-4" />
                </span>
                <input 
                  type="text" 
                  placeholder="Search documentation for keywords (e.g. VPN, Outlook)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-corporate-gray border border-corporate-grayBorder rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-corporate-blue text-slate-800"
                />
              </div>
              <button 
                type="submit" 
                className="bg-corporate-blue hover:bg-corporate-blueLight text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
              >
                Search
              </button>
            </form>
            
            <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
              <button
                onClick={() => setCategoryFilter('')}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                  categoryFilter === ''
                    ? 'bg-corporate-blue text-white border-corporate-blue'
                    : 'bg-white text-slate-600 border-corporate-grayBorder hover:bg-slate-50'
                }`}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategoryFilter(c)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                    categoryFilter === c
                      ? 'bg-corporate-blue text-white border-corporate-blue'
                      : 'bg-white text-slate-600 border-corporate-grayBorder hover:bg-slate-50'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Grid displays */}
          {loading && articles.length === 0 ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-8 h-8 border-4 border-corporate-orange border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articles.length === 0 ? (
                <div className="col-span-full bg-white border border-corporate-grayBorder rounded-2xl py-16 text-center text-corporate-textMuted text-xs font-semibold">
                  No article logs match your search.
                </div>
              ) : (
                articles.map((art) => (
                  <div
                    key={art.id || art._id}
                    onClick={() => handleArticleClick(art)}
                    className="bg-white border border-corporate-grayBorder hover:border-corporate-orange/20 rounded-2xl p-5 shadow-sm hover:shadow-premium transition-all duration-300 cursor-pointer flex flex-col justify-between"
                  >
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] uppercase font-extrabold px-2 py-0.5 bg-corporate-blueSoft text-corporate-blue rounded border border-corporate-blueSoft/30">
                          {art.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold flex items-center">
                          <Eye className="w-3.5 h-3.5 mr-0.5 inline" />
                          <span>{art.views} views</span>
                        </span>
                      </div>
                      
                      <h4 className="font-extrabold text-sm sm:text-base text-corporate-blue leading-tight hover:text-corporate-orange transition-colors">
                        {art.title}
                      </h4>
                      
                      <p className="text-xs text-corporate-textMuted line-clamp-3 leading-relaxed">
                        {art.content.replace(/[#*`\-]/g, '').substring(0, 160)}...
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
                      <button
                        type="button"
                        onClick={(e) => handleHelpfulVote(e, art.id || art._id)}
                        className={`inline-flex items-center space-x-1 text-[10px] font-bold px-2.5 py-1 border rounded-lg transition-colors ${
                          votedList.includes(art.id || art._id)
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-white text-slate-500 hover:text-green-700 hover:border-green-300'
                        }`}
                      >
                        <ThumbsUp className="w-3 h-3" />
                        <span>{art.helpfulVotes} Helpful</span>
                      </button>
                      
                      <span className="inline-flex items-center text-xs font-bold text-corporate-orange hover:text-corporate-orangeHover">
                        <span>Read article</span>
                        <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                      </span>
                    </div>

                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
