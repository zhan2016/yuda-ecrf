const getOptionsLang = require('../configHelpers').getOptionsLang;

const config = {
  title: {
    zh: '人口学资料',
    en: 'Demographic data'
  },
  formConfigs: [{
    name: 'screeningdate',
    type: 'date',
    commit: [{
      rule: 'date',
      start: 'subjAcceptDate',
      end: 'now'
    }],
    text: {
      zh: '首诊日期',
      en: 'Screening Date'
    }
  }, {
    name: 'sex',
    type: 'select',
    optionsGetter: 'getSexConfig',
    text: {
      zh: '性别',
      en: 'Gender'
    }
  }, {
    name: 'birth',
    type: 'numberfield',
    step: '1',
    requireCustomRange: true,
    text: {
      zh: '出生年份',
      en: 'Year of Birth'
    }
  }, {
    name: 'weight',
    type: 'numberfield',
    step: 'any',
    text: {
      zh: '体重(KG)',
      en: 'Body Weight (kg)'
    }
  }, {
    name: 'height',
    type: 'numberfield',
    step: '1',
    text: {
      zh: '身高(CM)',
      en: 'Height (cm)'
    }
  }],
  errors: [{
    name: 'exclusion',
    text: {
      zh: '该患者不符合入组标准',
      en: 'The patient does not fulfil the inclusion criteria'
    }
  }, {
    name: 'error_1',
    text: {
      zh: '病人年龄需在18至80岁之间',
      en: 'Male or female age ≥ 18 years and ≤ 80 years'
    }
  }]
};

module.exports = function(lang) {
  if (lang === undefined) {
    lang = 'zh';
  }

  const result = {};
  result.formConfigs = getOptionsLang(config.formConfigs, lang);
  result.errors = getOptionsLang(config.errors, lang);
  result.title = config.title[lang];

  return result;
};
