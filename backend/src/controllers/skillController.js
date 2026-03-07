import Skill from '../models/Skill.js';

// Get all skills
export const getSkills = async (req, res, next) => {
  try {
    const { category, search, limit = 100 } = req.query;
    
    const filter = {};
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const skills = await Skill.find(filter)
      .sort({ growthRate: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: skills,
    });
  } catch (error) {
    next(error);
  }
};

// Get skill by ID
export const getSkillById = async (req, res, next) => {
  try {
    const skill = await Skill.findOne({ id: req.params.id });

    if (!skill) {
      return res.status(404).json({
        success: false,
        error: { message: 'Skill not found' },
      });
    }

    res.json({
      success: true,
      data: skill,
    });
  } catch (error) {
    next(error);
  }
};

// Create or update skill
export const upsertSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findOneAndUpdate(
      { id: req.body.id },
      req.body,
      { upsert: true, new: true, runValidators: true }
    );

    res.status(201).json({
      success: true,
      data: skill,
    });
  } catch (error) {
    next(error);
  }
};

// Delete skill
export const deleteSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findOneAndDelete({ id: req.params.id });

    if (!skill) {
      return res.status(404).json({
        success: false,
        error: { message: 'Skill not found' },
      });
    }

    res.json({
      success: true,
      data: { message: 'Skill deleted successfully' },
    });
  } catch (error) {
    next(error);
  }
};
