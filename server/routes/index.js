const express = require('express');
const { requireAuth } = require('../middleware/auth');

const authRoutes = require('./authRoutes');
const profileController = require('../controllers/profileController');
const roleController = require('../controllers/roleController');
const skillController = require('../controllers/skillController');
const analysisController = require('../controllers/analysisController');
const roadmapController = require('../controllers/roadmapController');
const projectController = require('../controllers/projectController');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();

router.use('/auth', authRoutes);

router.use(requireAuth);

router.get('/dashboard', dashboardController.getDashboard);

router.get('/profile', profileController.getProfile);
router.put('/profile', profileController.updateProfile);
router.post('/profile/reset', profileController.resetData);

router.get('/roles', roleController.listRoles);
router.get('/roles/categories', roleController.listCategories);
router.get('/roles/:id', roleController.getRole);

router.get('/skills', skillController.listSkills);
router.post('/skills', skillController.createSkill);
router.put('/skills/:id', skillController.updateSkill);
router.delete('/skills/:id', skillController.deleteSkill);

router.get('/analysis/:roleId', analysisController.getAnalysis);

router.get('/roadmaps', roadmapController.listRoadmaps);
router.post('/roadmaps', roadmapController.createRoadmap);
router.put('/roadmaps/:id', roadmapController.updateRoadmap);
router.get('/roadmaps/:id/items', roadmapController.getRoadmapItemsHandler);
router.post('/roadmaps/:id/items', roadmapController.addRoadmapItem);
router.put('/roadmaps/:id/reorder', roadmapController.reorderRoadmapItems);
router.put('/roadmap-items/:itemId', roadmapController.updateRoadmapItem);
router.delete('/roadmap-items/:itemId', roadmapController.deleteRoadmapItem);

router.get('/projects', projectController.listProjects);
router.get('/projects/recommended/:roleId', projectController.recommendedProjects);

module.exports = router;
