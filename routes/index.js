const express = require('express');
const router = express.Router(); // eslint-disable-line

const mainController = require('../controllers/mainController');
const siteController = require('../controllers/siteController');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const caseController = require('../controllers/caseController');
const screeningChecklistController = require('../controllers/screeningChecklistController');
const reviewChecklistController = require('../controllers/reviewChecklistController');
const discontinuationController = require('../controllers/discontinuationController');
const surgeryController = require('../controllers/surgeryController');

router.get('/', mainController.homePage);

/**
 * Router for user
 */
router.get('/login', userController.loginForm);
router.post('/login', authController.login);
// show users table
router.get('/users', userController.usersTable);
// show form to create new user
router.get('/register', userController.registerForm);
// create new user
router.post('/register',
  userController.validateRegister,
  userController.register
);
// update user
router.post('/user/:id', userController.updateUser);
// remove user
router.get('/remove/user/:id', userController.removeUser);

// Router for case
router.get('/case', caseController.caseForm);
router.get('/screening/basic', caseController.caseBasicForm);
router.get('/screening/inclusion', caseController.caseInclusionForm);
router.get('/screening/exclusion', caseController.caseExclusionForm);
router.get('/screening/disease', caseController.caseDiseaseForm);
router.get('/screening/conmed', caseController.caseConMedForm);
router.get('/screening/vitalsign', caseController.caseVitalSignForm);
router.get('/screening/lab', caseController.caseLabForm);
router.get('/screening/assistant', caseController.caseAssistantForm);
router.get('/screening/method', caseController.caseMethodForm);
router.get('/screening/region', caseController.caseRegionForm);
router.get('/screening/dignose', caseController.caseDignoseForm);

// Router for screening-checklist
router.get('/screening-checklist', screeningChecklistController.screeningChecklistForm);

// Router for review-checklist
router.get('/review-checklist', reviewChecklistController.reviewChecklistForm);

// Router for discontinuation
router.get('/discontinuation', discontinuationController.discontinuationForm);

// Router for surgery
router.get('/surgery', surgeryController.surgeryForm);

/**
 * Router for site
 */
// show sites table
router.get('/sites', siteController.sitesTable);
// site form to create new site
router.get('/site', siteController.siteForm);
// create new site
router.post('/site', siteController.createSite);
// open site to edit
router.get('/site/:id', siteController.siteForm);
// update site
router.post('/site/:id', siteController.updateSite);
// remove site
router.get('/remove/site/:id', siteController.removeSite);

module.exports = router;
