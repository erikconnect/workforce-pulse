import Playbook from '../models/Playbook.js';

// Get all playbooks
export const getPlaybooks = async (req, res, next) => {
  try {
    const { sectorId, tags, limit = 50, skip = 0 } = req.query;
    
    const filter = {};
    if (sectorId) filter.sectorId = sectorId;
    if (tags) filter.tags = { $in: tags.split(',') };

    const playbooks = await Playbook.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Playbook.countDocuments(filter);

    res.json({
      success: true,
      data: {
        playbooks,
        pagination: {
          total,
          limit: parseInt(limit),
          skip: parseInt(skip),
          hasMore: total > parseInt(skip) + parseInt(limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get playbook by ID
export const getPlaybookById = async (req, res, next) => {
  try {
    const playbook = await Playbook.findOne({ id: req.params.id });

    if (!playbook) {
      return res.status(404).json({
        success: false,
        error: { message: 'Playbook not found' },
      });
    }

    res.json({
      success: true,
      data: playbook,
    });
  } catch (error) {
    next(error);
  }
};

// Create playbook
export const createPlaybook = async (req, res, next) => {
  try {
    const playbook = await Playbook.create(req.body);

    res.status(201).json({
      success: true,
      data: playbook,
    });
  } catch (error) {
    next(error);
  }
};

// Like/unlike playbook
export const toggleLike = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const playbook = await Playbook.findOne({ id });

    if (!playbook) {
      return res.status(404).json({
        success: false,
        error: { message: 'Playbook not found' },
      });
    }

    const hasLiked = playbook.likedBy.includes(userId);

    if (hasLiked) {
      playbook.likedBy = playbook.likedBy.filter(uid => uid !== userId);
      playbook.likes = Math.max(0, playbook.likes - 1);
    } else {
      playbook.likedBy.push(userId);
      playbook.likes += 1;
    }

    await playbook.save();

    res.json({
      success: true,
      data: {
        hasLiked: !hasLiked,
        likes: playbook.likes,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Save/unsave playbook
export const toggleSave = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const playbook = await Playbook.findOne({ id });

    if (!playbook) {
      return res.status(404).json({
        success: false,
        error: { message: 'Playbook not found' },
      });
    }

    const hasSaved = playbook.savedBy.includes(userId);

    if (hasSaved) {
      playbook.savedBy = playbook.savedBy.filter(uid => uid !== userId);
      playbook.saves = Math.max(0, playbook.saves - 1);
    } else {
      playbook.savedBy.push(userId);
      playbook.saves += 1;
    }

    await playbook.save();

    res.json({
      success: true,
      data: {
        hasSaved: !hasSaved,
        saves: playbook.saves,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete playbook
export const deletePlaybook = async (req, res, next) => {
  try {
    const playbook = await Playbook.findOneAndDelete({ id: req.params.id });

    if (!playbook) {
      return res.status(404).json({
        success: false,
        error: { message: 'Playbook not found' },
      });
    }

    res.json({
      success: true,
      data: { message: 'Playbook deleted successfully' },
    });
  } catch (error) {
    next(error);
  }
};
