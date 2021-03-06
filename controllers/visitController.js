const moment = require('moment');
moment.locale('zh-cn');

const mongoose = require('mongoose');
const Visit = mongoose.model('Visit');
const Surgery = mongoose.model('Surgery');

const helpers = require('./helpers');
const decorationHelper = require('./decorationHelper');
const getVisitConfig = require('../config/visit/getVisitConfig');
const getVisitTableConfig = require('../config/visit/getVisitTableConfig');
const getButtonConfig = require('../config/common/getButtonConfig');

const logger = require('../logger');
const loggerHelper = require('../loggerHelper');

async function getVisitListByCaseId(caseId) {
  const visitList = await Visit.find({
    case: caseId
  });
  return visitList;
}

function getDaysAfterSurgery(surgerydtc, visitdtc) {
  const surgerydtcValue = moment(surgerydtc).valueOf();
  const visitdtcValue = moment(visitdtc).valueOf();
  return Math.floor((visitdtcValue - surgerydtcValue) / 24 / 60 / 60 / 1000);
}

const tableName = 'visit';

exports.visitTable = async (req, res) => {
  const CaseNav = helpers.appendCaseIdToCaseNav(req.params.caseId, req.user.language);

  const surgery = await Surgery.findOne({
    case: req.params.caseId
  });
  const surgerydtc = (surgery && surgery.surgerydtc) ? surgery.surgerydtc : new Date();

  const visitList = await getVisitListByCaseId(req.params.caseId);
  const visitListFormated = visitList.map((item) => {
    const daysaftersurgery = getDaysAfterSurgery(surgerydtc, item.visitdtc);
    return {
      _id: item._id,
      case: item.case,
      visitdtc: moment(item.visitdtc).format('ll'),
      visitnum: item.visitnum,
      daysaftersurgery: daysaftersurgery,
      visitid: `${daysaftersurgery}.${item.visitnum}`
    };
  });
  visitListFormated.sort(function(a, b) {
    let vA = parseFloat(a.visitid);
    let vB = parseFloat(b.visitid);
    if (vA < vB) {
      return -1;
    }
    else if (vA > vB) {
      return 1;
    }
    else {
      return 0;
    }
  });
  logger.info(loggerHelper.createLogMessage(req.user, 'show', 'visit table', req.params.caseId));
  res.render('visit/visitTable', {
    caseNav: CaseNav,
    config: getVisitTableConfig(req.user.language),
    buttonConfig: getButtonConfig(req.user.language),
    visitList: visitListFormated,
    caseId: req.params.caseId
  });
};

exports.visitForm = async (req, res) => {
  const caseId = req.params.caseId;
  const visitId = req.params.visitId;
  const CaseNav = helpers.appendCaseIdToCaseNav(caseId, req.user.language);
  let visit;

  if (visitId !== undefined) {
    const visitItem = await Visit.findById(visitId);
    visit = visitItem.toObject();
  }
  else {
    visit = {
      case: caseId
    };
  }

  const surgery = await Surgery.findOne({
    case: req.params.caseId
  });
  const surgerydtc = (surgery && surgery.surgerydtc) ? surgery.surgerydtc : null;

  const config = getVisitConfig(req.user.language);
  Object.keys(config.formConfigs).forEach((key) => {
    if (config.formConfigs[key].type === 'select') {
      config.formConfigs[key].options = decorationHelper[config.formConfigs[key].optionsGetter](req.user.language);
    }
    if (key === 'visitdtc') {
      config.formConfigs[key].value = visit.visitdtc ? moment(visit.visitdtc).format('MM/DD/YYYY') : '';
      const startDateStr = surgerydtc === null ? null : moment(surgerydtc).format('MM/DD/YYYY');
      config.formConfigs[key].extra = JSON.stringify({
        start: startDateStr
      });
    }
    else {
      config.formConfigs[key].value = visit[key];
    }
    if (visitId !== undefined) {
      config.formConfigs[key].questionLink = helpers.getQuestionLink(tableName, 'visit', req.params.caseId, config.formConfigs[key], visitId);
    }

    if (config.formConfigs[key].type === 'checkbox' && config.formConfigs[key].value === undefined) {
      config.formConfigs[key].value = false;
    }
  });

  logger.info(loggerHelper.createLogMessage(req.user, 'show', 'visit', req.params.caseId));
  res.render('visit/visitForm', {
    caseNav: CaseNav,
    config,
    buttonConfig: getButtonConfig(req.user.language),
    caseId: caseId,
    visitId: visit._id
  });
};

exports.createVisit = async (req, res) => {
  const caseId = req.params.caseId;
  const config = getVisitConfig(req.user.language);
  Object.keys(config.formConfigs).forEach((key) => {
    const type = config.formConfigs[key].type;
    if (type === 'textarea' || type === 'textfield' || type === 'numberfield') {
      if (req.body[key] !== undefined) {
        req.body[key] = req.sanitizeBody(key).escape();
      }
    }
  });
  req.body.case = caseId;
  if (req.body.visitdtc === '') {
    delete req.body.visitdtc;
  }
  await (new Visit(req.body)).save();
  logger.info(loggerHelper.createLogMessage(req.user, 'create', 'visit', req.params.caseId), req.body);
  res.redirect(`/visitlist/${caseId}`);
};

exports.updateVisit = async (req, res) => {
  const caseId = req.params.caseId;
  const config = getVisitConfig(req.user.language);
  Object.keys(config.formConfigs).forEach((key) => {
    const type = config.formConfigs[key].type;
    if (type === 'textarea' || type === 'textfield' || type === 'numberfield') {
      if (req.body[key] !== undefined) {
        req.body[key] = req.sanitizeBody(key).escape();
      }
    }
  });
  req.body.case = caseId;
  if (req.body.visitdtc === '') {
    delete req.body.visitdtc;
  }
  const visitId = req.params.visitId;
  await Visit.findByIdAndUpdate(visitId, req.body);
  logger.info(loggerHelper.createLogMessage(req.user, 'update', 'visit', req.params.caseId), req.body);
  res.redirect(`/visitlist/${caseId}`);
};

exports.removeVisit = async (req, res) => {
  const caseId = req.params.caseId;
  const id = req.params.visitId;
  await Visit.findByIdAndRemove(id);
  logger.info(loggerHelper.createLogMessage(req.user, 'remove', 'visit', req.params.caseId), {id});
  res.redirect(`/visitlist/${caseId}`);
};
