const { KnowledgeBase } = require('../db');

const getArticles = async (req, res) => {
  try {
    const { search, category } = req.query;
    let articles = await KnowledgeBase.find({});

    if (category) {
      articles = articles.filter(art => art.category === category);
    }

    if (search) {
      const q = search.toLowerCase();
      articles = articles.filter(art => 
        art.title.toLowerCase().includes(q) || 
        art.content.toLowerCase().includes(q) ||
        art.category.toLowerCase().includes(q)
      );
    }

    res.json(articles);
  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({ message: 'Server error loading knowledge base' });
  }
};

const getArticleById = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await KnowledgeBase.findById(id);

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Increment view counter
    const updated = await KnowledgeBase.findByIdAndUpdate(id, { 
      views: (article.views || 0) + 1 
    });

    res.json(updated);
  } catch (error) {
    console.error('Get article detail error:', error);
    res.status(500).json({ message: 'Server error loading article' });
  }
};

const voteHelpful = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await KnowledgeBase.findById(id);

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    const updated = await KnowledgeBase.findByIdAndUpdate(id, { 
      helpfulVotes: (article.helpfulVotes || 0) + 1 
    });

    res.json({ message: 'Vote registered successfully', helpfulVotes: updated.helpfulVotes });
  } catch (error) {
    console.error('Vote helpful error:', error);
    res.status(500).json({ message: 'Server error updating votes' });
  }
};

module.exports = {
  getArticles,
  getArticleById,
  voteHelpful
};
