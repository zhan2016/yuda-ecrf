const getOptionsLang = require('../configHelpers').getOptionsLang;

const config = {
  title: {
    zh: '添加不良事件',
    en: 'add Adverse Event (AE)/ Device Deficiency '
  },

  subtitles: [
    {
      name: 'subtitle_1',
      text: {
        zh: '基本信息',
        en: 'AE Information'
      }
    },
    {
      name: 'subtitle_2',
      text: {
        zh: 'AE 情况',
        en: 'AE Description'
      }
    },
    {
      name: 'subtitle_3',
      text: {
        zh: 'AE 详情',
        en: 'AE Details'
      }
    },
    {
      name: 'subtitle_4',
      text: {
        zh: '其他',
        en: 'Others'
      },
    }
  ],
  formConfigs: [{
    name: 'aeorigion',
    type: 'customselect',
    text: {
      zh: '来源',
      en: 'Source'
    }
  }, {
    name: 'event',
    type: 'textfield',
    text: {
      zh: '事件 (名称及症状)',
      en: 'Event'
    }
  }, {
    name: 'aestdtc',
    type: 'datetime',
    commit: [{
      rule: 'date',
      end: 'aeeddtc'
    }],
    text: {
      zh: '发生时间',
      en: 'Date of onset'
    }
  }, {
    name: 'aeeddtc',
    type: 'datetime',
    commit: [{
      rule: 'date',
      start: 'aestdtc',
      end: 'now'
    }],
    text: {
      zh: '结束时间',
      en: 'Date of stop'
    }
  }, {
    name: 'aeserv',
    type: 'select',
    commit: [{
      rule: 'custom',
      message: {
        zh: '请完整填写《严重不良事件（SAE）报告》表',
        en: 'Complete Severe Adverse Event (SAE) report, please.'
      }
    }],
    optionsGetter: 'getAeLevelConfig',
    text: {
      zh: '严重程度',
      en: 'Severity'
    }
  }, {
    name: 'aeact',
    type: 'checkbox',
    text: {
      zh: '采取措施',
      en: 'Actions taken'
    }
  }, {
    name: 'aerpt',
    type: 'checkbox',
    text: {
      zh: '报告',
      en: 'Report'
    }
  }, {
    name: 'aerel',
    type: 'select',
    required: true,
    commit: [{
      rule: 'required'
    }],
    optionsGetter: 'getAeRelConfig',
    text: {
      zh: '与试验器械和/或试验操作的关系',
      en: 'Related to investigational device/procedure'
    }
  }, {
    name: 'aeres_1',
    type: 'select',
    optionsGetter: 'getAeResConfig',
    text: {
      zh: '转归',
      en: 'Outcome'
    }
  }, {
    name: 'aeres_2',
    type: 'checkbox',
    text: {
      zh: '有后遗症',
      en: 'Sequela'
    }
  }, {
    name: 'aesae',
    type: 'checkbox',
    text: {
      zh: 'SAE（请完整填写《严重不良事件（SAE）报告》表)',
      en: 'SAE (Complete Severe Adverse Event (SAE) report, please.)'
    }
  }, {
    name: 'aedevicedft',
    type: 'checkbox',
    text: {
      zh: '器械缺陷',
      en: 'Device deficiency'
    }
  }, {
    name: 'aediscon',
    type: 'checkbox',
    text: {
      zh: '因该事件退出试验（请完整填写《中途退出试验》表)',
      en: 'Withdrawal from the study (Complete Withdrawal from the Study report, please.)'
    }
  }],
  errors: [{
    name: 'error_1',
    text: {
      zh: '依据研究方案，SAE必须报告',
      en: 'According to Study Protocol, SAE must be reported separately in SAE section.'
    }
  }]
};

module.exports = function(lang) {
  if (lang === undefined) {
    lang = 'zh';
  }

  const result = {};
  result.formConfigs = getOptionsLang(config.formConfigs, lang);
  result.subtitles = getOptionsLang(config.subtitles, lang);
  result.errors = getOptionsLang(config.errors, lang);
  result.title = config.title[lang];

  return result;
};
