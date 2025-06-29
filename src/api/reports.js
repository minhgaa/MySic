const express = require('express');
const router = express.Router();
const Report = require('../models/report');
const Song = require('../models/song');
const User = require('../models/user');
const { isAdmin, isAuthenticated } = require('../middleware/auth');
const sampleReports = require('../data/sampleReports');

// Get user and song details by IDs
router.get('/details', isAuthenticated, async (req, res) => {
  try {
    const { userId, songId } = req.query;

    if (!userId || !songId) {
      return res.status(400).json({ message: 'Both userId and songId are required' });
    }

    // Fetch user and song information in parallel
    const [user, song] = await Promise.all([
      User.findById(userId).select('username email avatarUrl'),
      Song.findById(songId)
        .select('title artist songImage fileUrl status')
        .populate('uploadedBy', 'username email avatarUrl')
    ]);

    if (!user || !song) {
      return res.status(404).json({ 
        message: !user ? 'User not found' : 'Song not found' 
      });
    }

    // Transform data to match expected format
    const response = {
      user: {
        _id: user._id,
        name: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl || '/default-avatar.png'
      },
      song: {
        _id: song._id,
        title: song.title,
        artist: song.artist,
        songImage: song.songImage,
        fileUrl: song.fileUrl,
        status: song.status,
        uploadedBy: {
          _id: song.uploadedBy._id,
          name: song.uploadedBy.username,
          email: song.uploadedBy.email,
          avatarUrl: song.uploadedBy.avatarUrl || '/default-avatar.png'
        }
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all reports (admin only)
router.get('/', isAdmin, async (req, res) => {
  try {
    const reports = await Report.find()
      .populate({
        path: 'song',
        select: 'title artist songImage fileUrl status',
        populate: {
          path: 'uploadedBy',
          select: 'username email avatarUrl'
        }
      })
      .populate({
        path: 'reporter',
        select: 'username email avatarUrl'
      })
      .sort({ createdAt: -1 });

    // Transform data to match expected format
    const transformedReports = reports.map(report => ({
      reportId: report._id,
      song: {
        _id: report.song._id,
        title: report.song.title,
        artist: report.song.artist,
        songImage: report.song.songImage,
        fileUrl: report.song.fileUrl,
        status: report.song.status,
        uploadedBy: report.song.uploadedBy
      },
      reporter: {
        _id: report.reporter._id,
        name: report.reporter.username,
        email: report.reporter.email,
        avatarUrl: report.reporter.avatarUrl
      },
      description: report.description,
      status: report.status,
      createdAt: report.createdAt
    }));

    res.json(transformedReports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a new report
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { songId, description } = req.body;

    // Validate song exists
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    // Create report
    const report = new Report({
      song: songId,
      reporter: req.user._id,
      description
    });

    await report.save();

    // Return report with populated data
    const populatedReport = await Report.findById(report._id)
      .populate({
        path: 'song',
        select: 'title artist songImage fileUrl status',
        populate: {
          path: 'uploadedBy',
          select: 'username email avatarUrl'
        }
      })
      .populate({
        path: 'reporter',
        select: 'username email avatarUrl'
      });

    const transformedReport = {
      reportId: populatedReport._id,
      song: {
        _id: populatedReport.song._id,
        title: populatedReport.song.title,
        artist: populatedReport.song.artist,
        songImage: populatedReport.song.songImage,
        fileUrl: populatedReport.song.fileUrl,
        status: populatedReport.song.status,
        uploadedBy: populatedReport.song.uploadedBy
      },
      reporter: {
        _id: populatedReport.reporter._id,
        name: populatedReport.reporter.username,
        email: populatedReport.reporter.email,
        avatarUrl: populatedReport.reporter.avatarUrl
      },
      description: populatedReport.description,
      status: populatedReport.status,
      createdAt: populatedReport.createdAt
    };
    
    res.status(201).json(transformedReport);
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Handle report action (approve/reject)
router.patch('/:reportId/:action', isAdmin, async (req, res) => {
  try {
    const { reportId, action } = req.params;
    
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.status = action === 'approve' ? 'approved' : 'rejected';
    await report.save();

    // If report is approved, you might want to take action on the song
    if (action === 'approve') {
      const song = await Song.findById(report.song);
      if (song) {
        song.status = 'rejected'; // Or any other appropriate action
        await song.save();
      }
    }

    // Return updated report with populated data
    const updatedReport = await Report.findById(reportId)
      .populate({
        path: 'song',
        select: 'title artist songImage fileUrl status',
        populate: {
          path: 'uploadedBy',
          select: 'username email avatarUrl'
        }
      })
      .populate({
        path: 'reporter',
        select: 'username email avatarUrl'
      });

    const transformedReport = {
      reportId: updatedReport._id,
      song: {
        _id: updatedReport.song._id,
        title: updatedReport.song.title,
        artist: updatedReport.song.artist,
        songImage: updatedReport.song.songImage,
        fileUrl: updatedReport.song.fileUrl,
        status: updatedReport.song.status,
        uploadedBy: updatedReport.song.uploadedBy
      },
      reporter: {
        _id: updatedReport.reporter._id,
        name: updatedReport.reporter.username,
        email: updatedReport.reporter.email,
        avatarUrl: updatedReport.reporter.avatarUrl
      },
      description: updatedReport.description,
      status: updatedReport.status,
      createdAt: updatedReport.createdAt
    };

    res.json(transformedReport);
  } catch (error) {
    console.error(`Error ${req.params.action}ing report:`, error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 