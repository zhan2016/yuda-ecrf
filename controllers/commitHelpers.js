const mongoose = require('mongoose');
const Screening = mongoose.model('Screening');
const ScreeningChecklist = mongoose.model('ScreeningChecklist');
const ReviewChecklist = mongoose.model('ReviewChecklist');
const Cm = mongoose.model('Cm');
const Sae = mongoose.model('Sae');
const Ae = mongoose.model('Ae');
const Surgery = mongoose.model('Surgery');
const Visit = mongoose.model('Visit');
const Case = mongoose.model('Case');

const getCommitCaseConfig = require('../config/getCommitCaseConfig');

const helpers = require('./helpers');

const getScreeningBasicConfig = require('../config/screening/getScreeningBasicConfig');
const getScreeningAssistantConfig = require('../config/screening/getScreeningAssistantConfig');
const getScreeningConMedConfig = require('../config/screening/getScreeningConMedConfig');
const getScreeningDignoseConfig = require('../config/screening/getScreeningDignoseConfig');
const getScreeningDiseaseConfig = require('../config/screening/getScreeningDiseaseConfig');
const getScreeningExclusionConfig = require('../config/screening/getScreeningExclusionConfig');
const getScreeningInclusionConfig = require('../config/screening/getScreeningInclusionConfig');
const getScreeningLabConfig = require('../config/screening/getScreeningLabConfig');
const getScreeningMethodConfig = require('../config/screening/getScreeningMethodConfig');
const getScreeningRegionConfig = require('../config/screening/getScreeningRegionConfig');
const getScreeningVitalSignConfig = require('../config/screening/getScreeningVitalSignConfig');

const getScreeningChecklistConfig = require('../config/getScreeningChecklistConfig');
const getReviewChecklistConfig = require('../config/getReviewChecklistConfig');
const getSurgeryConfig = require('../config/surgery/getSurgeryConfig');
const getVisitConfig = require('../config/visit/getVisitConfig');
const getCmConfig = require('../config/cm/getCmConfig');
const getAeConfig = require('../config/ae/getAeConfig');
const getSaeConfig = require('../config/sae/getSaeConfig');

function doMustTrueCheck(value) {
  return value === true;
}

function doMustFalseCheck(value) {
  return value === false;
}

function doRequiredCheck(value) {
  return value !== undefined && value !== null && value !== '';
}

function doDateCheck(value, start, end) {
  if (start === null || end === null || value === null) {
    return false;
  }
  else {
    return value >= start && value <= end;
  }
}

function doOnlyOnceCheck(fieldName, ruleConfig, listToCheck) {
  const matches = listToCheck.filter((item) => {
    return item[fieldName] === ruleConfig.value;
  });
  return matches.length === 1;
}

function doConditionalRequireCheck(value, requiredValue, currentValue) {
  if (requiredValue === currentValue) {
    return value !== undefined;
  }
  else {
    return true;
  }
}

function doReviewChecklistCustomValidation(caseId, key, obj, ruleConfig, validateResult, cmList) {
  if (obj[key] !== true) {
    return true;
  }
  else {
    if (cmList.length === 0 || cmList.find((item) => item.source === 'visit2') === undefined) {
      if (validateResult.children === undefined) {
        validateResult.children = [];
      }
      validateResult.children.push({
        pass: false,
        message: ruleConfig.message,
        link: `/cmlist/${caseId}`
      });
      return false;
    }
  }
}

function doSurgeryCustomValidation(caseId, key, obj, ruleConfig, validateResult, aeList) {
  if (obj[key] !== true) {
    return true;
  }
  else {
    if (aeList.length === 0 || aeList.find((item) => item.aeorigion === 'surgery') === undefined) {
      if (validateResult.children === undefined) {
        validateResult.children = [];
      }
      validateResult.children.push({
        pass: false,
        message: ruleConfig.message,
        link: `/aelist/${caseId}`
      });
      return false;
    }
  }
}

function doVisitCustomValidation(caseId, key, obj, ruleConfig, validateResult, aeList, cmList) {
  if (obj[key] !== true) {
    return true;
  }
  else {
    if (key === 'param_22') {
      if (aeList.length === 0 || aeList.find((item) => item.aeorigion === obj._id.toString()) === undefined) {
        if (validateResult.children === undefined) {
          validateResult.children = [];
        }
        validateResult.children.push({
          pass: false,
          message: ruleConfig.message,
          link: `/aelist/${caseId}`
        });
        return false;
      }
    }
    else if (key === 'param_18') {
      if (cmList.length === 0 || cmList.find((item) => item.source === obj._id.toString()) === undefined) {
        if (validateResult.children === undefined) {
          validateResult.children = [];
        }
        validateResult.children.push({
          pass: false,
          message: ruleConfig.message,
          link: `/cmlist/${caseId}`
        });
        return false;
      }
    }
  }
}

function doAeCustomValidation(caseId, key, obj, ruleConfig, validateResult, saeList, idToAppend) {
  if (obj[key] !== 2) {
    return true;
  }
  else {
    if (saeList.length === 0 || saeList.find((item) => item.saeorigion.toString() === obj._id.toString()) === undefined) {
      if (validateResult.children === undefined) {
        validateResult.children = [];
      }
      validateResult.children.push({
        pass: false,
        message: ruleConfig.message,
        link: `/saelist/${caseId}`
      });
      return false;
    }
  }
}

function doCommitValidation(caseId, key, obj, rules, extra, validateResult) {
  const failed = rules.find((ruleConfig) => {
    let result = true;
    const ruleName = ruleConfig.rule;
    if (ruleName === 'must_true') {
      result = doMustTrueCheck(obj[key]);
    }
    else if (ruleName === 'must_false') {
      result = doMustFalseCheck(obj[key]);
    }
    else if (ruleName === 'required') {
      result = doRequiredCheck(obj[key]);
    }
    else if (ruleName === 'date') {
      let start;
      if (ruleConfig.start === undefined) {
        start = -1;
      }
      else {
        start = ruleConfig.start === 'now' ? new Date().valueOf() : extra[ruleConfig.start];
      }
      const end = ruleConfig.end === 'now' ? new Date().valueOf() : extra[ruleConfig.end];
      const date = obj[key] === undefined ? null : obj[key].valueOf();
      result = doDateCheck(date, start, end);
    }
    else if (ruleName === 'custom') {
      if (key === 'reviewcheck_3' || key === 'reviewcheck_4') {
        result = doReviewChecklistCustomValidation(caseId, key, obj, ruleConfig, validateResult, extra.cmList);
      }
      else if (key === 'surgery_14') {
        result = doSurgeryCustomValidation(caseId, key, obj, ruleConfig, validateResult, extra.aeList);
      }
      else if (key === 'param_18' || key === 'param_22') {
        result = doVisitCustomValidation(caseId, key, obj, ruleConfig, validateResult, extra.aeList, extra.cmList);
      }
      else if (key === 'aeserv') {
        result = doAeCustomValidation(caseId, key, obj, ruleConfig, validateResult, extra.saeList, extra.idToAppend);
      }
    }
    else if (ruleName === 'only_once') {
      result = doOnlyOnceCheck(key, ruleConfig, extra[key]);
    }
    else if (ruleName === 'conditional_require') {
      result = doConditionalRequireCheck(obj[key], ruleConfig.value, extra[ruleConfig.field]);
    }
    else if (ruleName === 'custom_date') {
      if (key === 'saedtc') {
        const date = obj[key] === undefined ? null : obj[key].valueOf();
        let end;
        const now = new Date().valueOf();
        if (obj.saestdtc === undefined) {
          end = now;
        }
        else {
          const saestdtc = obj.saestdtc.valueOf() + 24 * 60 * 60 * 1000;
          end = saestdtc > now ? now : saestdtc;
        }
        result = doDateCheck(date, 0, end);
      }
    }
    return result === false;
  });
  return failed === undefined;
}

function doCommitValidationForWholeTable(caseId, validateResult, commitCaseConfig, formConfigs, model, extra) {
  Object.keys(formConfigs).forEach((key) => {
    const config = formConfigs[key];
    if (config.commit !== undefined) {
      const result = doCommitValidation(caseId, key, model, config.commit, extra, validateResult);
      if (result === false) {
        validateResult.pass = false;
        validateResult.invalidFields.push(key);
      }
    }
  });
  if (validateResult.pass === false) {
    validateResult.link = `${validateResult.linkBase}/${caseId}`;
    if (extra && extra.idToAppend !== undefined) {
      validateResult.link = validateResult.link + '/' + extra.idToAppend;
    }
    validateResult.message = validateResult.text;
    validateResult.resultText = commitCaseConfig.ongoing;
    validateResult.resultType = 'ongoing';
  }
  else {
    validateResult.message = validateResult.text;
    validateResult.resultText = commitCaseConfig.finish;
    validateResult.resultType = 'finish';
  }
}

function initValidateResult(config) {
  const result = {
    name: '',
    pass: true,
    resultText: '',
    link: ''
  };
  return Object.assign({invalidFields: []}, result, config);
}

function getCommitCaseConfigItem(configs, name) {
  return configs.find((item) => {
    return item.name === name;
  });
}

exports.validateCaseOverview = async function(caseId, lang) {
  const commitCaseConfig = getCommitCaseConfig(lang);
  const caseItem = await Case.findById(caseId);
  const caseOverviewValidateResult = initValidateResult(getCommitCaseConfigItem(commitCaseConfig.records, 'overview'));

  if (!caseItem.attachedDoc) {
    caseOverviewValidateResult.pass = false;
    caseOverviewValidateResult.link = `${caseOverviewValidateResult.linkBase}/${caseId}`;
    caseOverviewValidateResult.message = caseOverviewValidateResult.text;
    caseOverviewValidateResult.resultText = commitCaseConfig.ongoing;
    caseOverviewValidateResult.resultType = 'ongoig';
    caseOverviewValidateResult.errors = [commitCaseConfig.errorMessages.error_2.text];
  }
  else {
    caseOverviewValidateResult.pass = true;
    caseOverviewValidateResult.message = caseOverviewValidateResult.text;
    caseOverviewValidateResult.resultText = commitCaseConfig.finish;
    caseOverviewValidateResult.resultType = 'finish';
  }

  return caseOverviewValidateResult;
};

exports.validateScreeningForm = async function(caseId, lang) {
  const commitCaseConfig = getCommitCaseConfig(lang);
  const screeningItem = await Screening.findOne({
    case: caseId
  });
  const screeningValidateResult = initValidateResult(getCommitCaseConfigItem(commitCaseConfig.records, 'screening'));

  // 未填表，直接返回
  if (screeningItem === null) {
    screeningValidateResult.pass = false;
    screeningValidateResult.link = `${screeningValidateResult.linkBase}/${caseId}`;
    screeningValidateResult.message = screeningValidateResult.text;
    screeningValidateResult.resultText = commitCaseConfig.empty;
    screeningValidateResult.resultType = 'empty';
  }
  else {
    const caseItem = await Case.findById(caseId);
    const extra = {
      subjAcceptDate: caseItem.subjAcceptDate.valueOf()
    };
    screeningValidateResult.children = screeningValidateResult.children.map((item) => {
      return initValidateResult(item);
    });

    screeningValidateResult.children.forEach((childResult) => {
      let formConfigs;
      if (childResult.name === 'screening-basic') {
        formConfigs = getScreeningBasicConfig(lang).formConfigs;
      }
      else if (childResult.name === 'screening-inclusion') {
        formConfigs = getScreeningInclusionConfig(lang).formConfigs;
      }
      else if (childResult.name === 'screening-exclusion') {
        formConfigs = getScreeningExclusionConfig(lang).formConfigs;
      }
      else if (childResult.name === 'screening-method') {
        formConfigs = getScreeningMethodConfig(lang).formConfigs;
      }
      else if (childResult.name === 'screening-region') {
        formConfigs = getScreeningRegionConfig(lang).formConfigs;
      }
      else if (childResult.name === 'screening-lab') {
        formConfigs = getScreeningLabConfig(lang).formConfigs;
      }
      else if (childResult.name === 'screening-assistant') {
        formConfigs = getScreeningAssistantConfig(lang).formConfigs;
      }
      else if (childResult.name === 'screening-disease') {
        formConfigs = getScreeningDiseaseConfig(lang).formConfigs;
      }
      else if (childResult.name === 'screening-dignose') {
        formConfigs = getScreeningDignoseConfig(lang).formConfigs;
      }
      else if (childResult.name === 'screening-conmed') {
        formConfigs = getScreeningConMedConfig(lang).formConfigs;
      }
      else if (childResult.name === 'screening-vitalsign') {
        formConfigs = getScreeningVitalSignConfig(lang).formConfigs;
      }

      doCommitValidationForWholeTable(caseId, childResult, commitCaseConfig, formConfigs, screeningItem, extra);
    });

    screeningValidateResult.message = screeningValidateResult.text;
  }

  return screeningValidateResult;
};

exports.validateScreeningChecklistForm = async function(caseId, lang) {
  const commitCaseConfig = getCommitCaseConfig(lang);
  const screeningChecklistItem = await ScreeningChecklist.findOne({
    case: caseId
  });
  const screeningChecklistValidateResult = initValidateResult(getCommitCaseConfigItem(commitCaseConfig.records, 'screeningchecklist'));

  if (screeningChecklistItem === null) {
    screeningChecklistValidateResult.pass = false;
    screeningChecklistValidateResult.link = `${screeningChecklistValidateResult.linkBase}/${caseId}`;
    screeningChecklistValidateResult.message = screeningChecklistValidateResult.text;
    screeningChecklistValidateResult.resultText = commitCaseConfig.empty;
    screeningChecklistValidateResult.resultType = 'empty';
  }
  else {
    const formConfigs = getScreeningChecklistConfig(lang).formConfigs;
    const screeningItem = await Screening.findOne({
      case: caseId
    });
    const extra = {
      screeningdate: screeningItem.screeningdate.valueOf()
    };
    doCommitValidationForWholeTable(caseId, screeningChecklistValidateResult, commitCaseConfig, formConfigs, screeningChecklistItem, extra);
  }
  return screeningChecklistValidateResult;
};

exports.validateReviewChecklistForm = async function(caseId, lang) {
  const commitCaseConfig = getCommitCaseConfig(lang);
  const reviewChecklistItem = await ReviewChecklist.findOne({
    case: caseId
  });
  const reviewChecklistValidateResult = initValidateResult(getCommitCaseConfigItem(commitCaseConfig.records, 'reviewchecklist'));

  if (reviewChecklistItem === null) {
    reviewChecklistValidateResult.pass = false;
    reviewChecklistValidateResult.link = `${reviewChecklistValidateResult.linkBase}/${caseId}`;
    reviewChecklistValidateResult.message = reviewChecklistValidateResult.text;
    reviewChecklistValidateResult.resultText = commitCaseConfig.empty;
    reviewChecklistValidateResult.resultType = 'empty';
  }
  else {
    const caseItem = await Case.findById(caseId);
    const cmList = await Cm.find({
      case: caseId
    });
    const extra = {
      subjAcceptDate: caseItem.subjAcceptDate.valueOf(),
      cmList
    };
    const formConfigs = getReviewChecklistConfig(lang).formConfigs;
    doCommitValidationForWholeTable(caseId, reviewChecklistValidateResult, commitCaseConfig, formConfigs, reviewChecklistItem, extra);
  }
  return reviewChecklistValidateResult;
};

exports.validateSurgeryForm = async function(caseId, lang) {
  const commitCaseConfig = getCommitCaseConfig(lang);
  const surgeryItem = await Surgery.findOne({
    case: caseId
  });
  const surgeryValidateResult = initValidateResult(getCommitCaseConfigItem(commitCaseConfig.records, 'surgery'));

  if (surgeryItem === null) {
    surgeryValidateResult.pass = false;
    surgeryValidateResult.link = `${surgeryValidateResult.linkBase}/${caseId}`;
    surgeryValidateResult.message = surgeryValidateResult.text;
    surgeryValidateResult.resultText = commitCaseConfig.empty;
    surgeryValidateResult.resultType = 'empty';
  }
  else {
    const reviewItem = await ReviewChecklist.findOne({
      case: caseId
    });
    const aeList = await Ae.find({
      case: caseId
    });
    const extra = {
      reviewcheckdate: reviewItem.reviewcheckdate.valueOf(),
      aeList
    };
    const formConfigs = getSurgeryConfig(lang).formConfigs;
    doCommitValidationForWholeTable(caseId, surgeryValidateResult, commitCaseConfig, formConfigs, surgeryItem, extra);
  }
  return surgeryValidateResult;
};

exports.validateVisitForm = async function(caseId, lang) {
  const commitCaseConfig = getCommitCaseConfig(lang);
  const visitList = await Visit.find({
    case: caseId
  });
  const visitNameList = await helpers.getVisitNameList(caseId, lang);
  const visitValidateResult = initValidateResult(getCommitCaseConfigItem(commitCaseConfig.records, 'visit'));

  if (visitList.length === 0) {
    visitValidateResult.pass = false;
    visitValidateResult.link = `/visitlist/${caseId}`;
    visitValidateResult.message = visitValidateResult.text;
    visitValidateResult.resultText = commitCaseConfig.empty;
    visitValidateResult.resultType = 'empty';
  }
  else {
    visitValidateResult.message = `${visitValidateResult.text}`;
    visitValidateResult.resultText = commitCaseConfig.finish;
    visitValidateResult.resultType = 'finish';
    const surgeryItem = await Surgery.findOne({
      case: caseId
    });
    const aeList = await Ae.find({
      case: caseId
    });
    const cmList = await Cm.find({
      case: caseId
    });
    const extra = {
      'surgerydtc': surgeryItem.surgerydtc === undefined ? null : surgeryItem.surgerydtc.valueOf(),
      aeList,
      cmList,
      'param_19': visitList
    };
    const formConfigs = getVisitConfig(lang).formConfigs;
    visitValidateResult.children = [];
    visitList.forEach((visitItem) => {
      const visitNameItem = visitNameList.find((item) => item.value === visitItem._id.toString());
      const visitItemValidateResult = {
        pass: true,
        linkBase: `/visit`,
        invalidFields: [],
        text: visitNameItem.text
      };
      extra.idToAppend = visitItem._id.toString();
      visitValidateResult.children.push(visitItemValidateResult);
      doCommitValidationForWholeTable(caseId, visitItemValidateResult, commitCaseConfig, formConfigs, visitItem, extra);
    });

    const falseItem = visitValidateResult.children.find((item) => item.pass === false);
    if (falseItem) {
      visitValidateResult.resultText = commitCaseConfig.ongoing;
      visitValidateResult.resultType = 'ongoing';

      const visitParam19TrueItems = visitList.filter((visitItem) => visitItem.param_19 === true);
      if (visitParam19TrueItems.length !== 1) {
        if (visitValidateResult.errors === undefined) {
          visitValidateResult.errors = [];
        }
        visitValidateResult.errors.push(commitCaseConfig.errorMessages.error_1.text);
      }
    }
  }
  return visitValidateResult;
};

exports.validateCmForm = async function(caseId, lang) {
  const commitCaseConfig = getCommitCaseConfig(lang);
  const cmList = await Cm.find({
    case: caseId
  });
  const cmValidateResult = initValidateResult(getCommitCaseConfigItem(commitCaseConfig.records, 'cm'));

  if (cmList.length === 0) {
    cmValidateResult.pass = null;
  }
  else {
    cmValidateResult.message = `${cmValidateResult.text}`;
    cmValidateResult.resultText = commitCaseConfig.finish;
    cmValidateResult.resultType = 'finish';
    const formConfigs = getCmConfig(lang).formConfigs;
    cmValidateResult.children = [];
    cmList.forEach((cmItem) => {
      const extra = {
        cmstdtc: cmItem.cmstdtc === undefined ? null : cmItem.cmstdtc.valueOf(),
        cmeddtc: cmItem.cmeddtc === undefined ? null : cmItem.cmeddtc.valueOf(),
        idToAppend: cmItem._id.toString()
      };
      const cmItemValidateResult = {
        pass: true,
        linkBase: `/cm`,
        invalidFields: [],
        text: cmItem.drug
      };
      cmValidateResult.children.push(cmItemValidateResult);
      doCommitValidationForWholeTable(caseId, cmItemValidateResult, commitCaseConfig, formConfigs, cmItem, extra);
    });

    const falseItem = cmValidateResult.children.find((item) => item.pass === false);
    if (falseItem) {
      cmValidateResult.resultText = commitCaseConfig.ongoing;
      cmValidateResult.resultType = 'ongoing';
    }
  }

  return cmValidateResult;
};

exports.validateAeForm = async function(caseId, lang) {
  const commitCaseConfig = getCommitCaseConfig(lang);
  const aeList = await Ae.find({
    case: caseId
  });
  const aeValidateResult = initValidateResult(getCommitCaseConfigItem(commitCaseConfig.records, 'ae'));

  if (aeList.length === 0) {
    aeValidateResult.pass = null;
  }
  else {
    const saeList = await Sae.find({
      case: caseId
    });
    aeValidateResult.message = `${aeValidateResult.text}`;
    aeValidateResult.resultText = commitCaseConfig.finish;
    aeValidateResult.resultType = 'finish';
    const formConfigs = getAeConfig(lang).formConfigs;
    aeValidateResult.children = [];
    aeList.forEach((aeItem) => {
      const extra = {
        aestdtc: aeItem.aestdtc === undefined ? null : aeItem.aestdtc.valueOf(),
        aeeddtc: aeItem.aeeddtc === undefined ? null : aeItem.aeeddtc.valueOf(),
        saeList: saeList,
        idToAppend: aeItem._id.toString()
      };
      const aeItemValidateResult = {
        pass: true,
        linkBase: `/ae`,
        invalidFields: [],
        text: aeItem.event
      };
      aeValidateResult.children.push(aeItemValidateResult);
      doCommitValidationForWholeTable(caseId, aeItemValidateResult, commitCaseConfig, formConfigs, aeItem, extra);
    });

    const falseItem = aeValidateResult.children.find((item) => item.pass === false);
    if (falseItem) {
      aeValidateResult.resultText = commitCaseConfig.ongoing;
      aeValidateResult.resultType = 'ongoing';
    }
  }
  return aeValidateResult;
};

exports.validateSaeForm = async function(caseId, lang) {
  const commitCaseConfig = getCommitCaseConfig(lang);
  const saeList = await Sae.find({
    case: caseId
  });
  const aeList = await Ae.find({
    case: caseId
  });
  const saeValidateResult = initValidateResult(getCommitCaseConfigItem(commitCaseConfig.records, 'sae'));

  if (saeList.length === 0) {
    saeValidateResult.pass = null;
  }
  else {
    saeValidateResult.message = `${saeValidateResult.text}`;
    saeValidateResult.resultText = commitCaseConfig.finish;
    saeValidateResult.resultType = 'finish';
    const formConfigs = getSaeConfig(lang).formConfigs;
    saeValidateResult.children = [];
    saeList.forEach((saeItem) => {
      const extra = {
        saestdtc: saeItem.saestdtc === undefined ? null : saeItem.saestdtc.valueOf(),
        saecaus_1: saeItem.saecaus_1,
        saecaus_9: saeItem.saecause_9,
        idToAppend: saeItem._id.toString()
      };
      const aeItem = aeList.find((item) => {
        return item._id.toString() === saeItem.saeorigion;
      });
      const saeItemValidateResult = {
        pass: true,
        linkBase: `/sae`,
        invalidFields: [],
        text: aeItem.event
      };
      saeValidateResult.children.push(saeItemValidateResult);
      doCommitValidationForWholeTable(caseId, saeItemValidateResult, commitCaseConfig, formConfigs, saeItem, extra);
    });
    const falseItem = saeValidateResult.children.find((item) => item.pass === false);
    if (falseItem) {
      saeValidateResult.resultText = commitCaseConfig.ongoing;
      saeValidateResult.resultType = 'ongoing';
    }
  }
  return saeValidateResult;
};
