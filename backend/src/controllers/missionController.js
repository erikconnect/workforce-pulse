import Mission from '../models/Mission.js';

// Get all missions
export const getMissions = async (req, res, next) => {
  try {
    const { status, sectorId } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (sectorId) filter.sectorId = sectorId;

    const missions = await Mission.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: missions,
    });
  } catch (error) {
    next(error);
  }
};

// Get mission by ID
export const getMissionById = async (req, res, next) => {
  try {
    const mission = await Mission.findOne({ id: req.params.id });

    if (!mission) {
      return res.status(404).json({
        success: false,
        error: { message: 'Mission not found' },
      });
    }

    res.json({
      success: true,
      data: mission,
    });
  } catch (error) {
    next(error);
  }
};

// Create mission
export const createMission = async (req, res, next) => {
  try {
    const mission = await Mission.create(req.body);

    res.status(201).json({
      success: true,
      data: mission,
    });
  } catch (error) {
    next(error);
  }
};

// Update mission step
export const updateMissionStep = async (req, res, next) => {
  try {
    const { id, stepId } = req.params;
    const { completed } = req.body;

    const mission = await Mission.findOne({ id });

    if (!mission) {
      return res.status(404).json({
        success: false,
        error: { message: 'Mission not found' },
      });
    }

    const step = mission.steps.find(s => s.id === stepId);
    if (!step) {
      return res.status(404).json({
        success: false,
        error: { message: 'Step not found' },
      });
    }

    step.completed = completed;

    // Recalculate progress
    const completedSteps = mission.steps.filter(s => s.completed).length;
    mission.progress = Math.round((completedSteps / mission.steps.length) * 100);

    // Auto-complete mission if all steps done
    if (mission.progress === 100) {
      mission.status = 'completed';
    }

    await mission.save();

    res.json({
      success: true,
      data: mission,
    });
  } catch (error) {
    next(error);
  }
};

// Update mission
export const updateMission = async (req, res, next) => {
  try {
    const mission = await Mission.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!mission) {
      return res.status(404).json({
        success: false,
        error: { message: 'Mission not found' },
      });
    }

    res.json({
      success: true,
      data: mission,
    });
  } catch (error) {
    next(error);
  }
};

// Delete mission
export const deleteMission = async (req, res, next) => {
  try {
    const mission = await Mission.findOneAndDelete({ id: req.params.id });

    if (!mission) {
      return res.status(404).json({
        success: false,
        error: { message: 'Mission not found' },
      });
    }

    res.json({
      success: true,
      data: { message: 'Mission deleted successfully' },
    });
  } catch (error) {
    next(error);
  }
};
