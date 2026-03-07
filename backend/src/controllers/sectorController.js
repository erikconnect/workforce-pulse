import Sector from '../models/Sector.js';

// Get all sectors
export const getSectors = async (req, res, next) => {
  try {
    const sectors = await Sector.find().sort({ pulseScore: -1 });

    res.json({
      success: true,
      data: sectors,
    });
  } catch (error) {
    next(error);
  }
};

// Get sector by ID
export const getSectorById = async (req, res, next) => {
  try {
    const sector = await Sector.findOne({ id: req.params.id });

    if (!sector) {
      return res.status(404).json({
        success: false,
        error: { message: 'Sector not found' },
      });
    }

    res.json({
      success: true,
      data: sector,
    });
  } catch (error) {
    next(error);
  }
};

// Create or update sector
export const upsertSector = async (req, res, next) => {
  try {
    const sector = await Sector.findOneAndUpdate(
      { id: req.body.id },
      req.body,
      { upsert: true, new: true, runValidators: true }
    );

    res.status(201).json({
      success: true,
      data: sector,
    });
  } catch (error) {
    next(error);
  }
};

// Delete sector
export const deleteSector = async (req, res, next) => {
  try {
    const sector = await Sector.findOneAndDelete({ id: req.params.id });

    if (!sector) {
      return res.status(404).json({
        success: false,
        error: { message: 'Sector not found' },
      });
    }

    res.json({
      success: true,
      data: { message: 'Sector deleted successfully' },
    });
  } catch (error) {
    next(error);
  }
};
