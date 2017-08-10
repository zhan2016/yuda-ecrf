const getOptionsLang = require('../configHelpers').getOptionsLang;

const config = {
  title: {
    zh: '排除标准'
  },
  options: [{
    name: 'exclusion_1',
    text: {
      zh: '当前病情需要紧急救护'
    }
  }, {
    name: 'exclusion_2',
    text: {
      zh: '当前外科情况为肠梗阻或肠穿孔，局部或全身感染、腹膜炎、小肠局部缺血或者严重癌转移'
    }
  }, {
    name: 'exclusion_3',
    text: {
      zh: '肛管狭窄或存在其他可致肛管梗阻的情况'
    }
  }, {
    name: 'exclusion_4',
    text: {
      zh: '既往有较大腹部手术病史，既往腹部或盆腔的放射治疗'
    }
  }, {
    name: 'exclusion_5',
    text: {
      zh: 'ASA III - VI'
    }
  }, {
    name: 'exclusion_6',
    text: {
      zh: '白蛋白低于35 g/l'
    }
  }, {
    name: 'exclusion_7',
    text: {
      zh: '炎性肠病(溃疡性结肠炎或克罗恩病)'
    }
  }, {
    name: 'exclusion_8',
    text: {
      zh: '病情需要两处或以上肠吻合'
    }
  }, {
    name: 'exclusion_9',
    text: {
      zh: '术前一个月内使用过皮质激素、免疫抑制剂'
    }
  }, {
    name: 'exclusion_10',
    text: {
      zh: '全身麻醉禁忌症'
    }
  }, {
    name: 'exclusion_11',
    text: {
      zh: '术前或术中发现肠管直径异常或肠壁厚度异常'
    }
  }, {
    name: 'exclusion_12',
    text: {
      zh: '因认知能力所限，不能理解与试验研究相关的资料，不能了解试验研究的目的和设计，或患者不同意参加本试验'
    }
  }, {
    name: 'exclusion_13',
    text: {
      zh: 'BMI > 35'
    }
  }, {
    name: 'exclusion_14',
    text: {
      zh: '术前六个月内发生过心肌梗死或其他严重心脏疾病'
    }
  }, {
    name: 'exclusion_15',
    text: {
      zh: '严重凝血方面疾病'
    }
  }, {
    name: 'exclusion_16',
    text: {
      zh: '其他外科医生认为不适宜参加本试验研究的情况'
    }
  }, {
    name: 'exclusion_17',
    text: {
      zh: '其他外科医生认为不适宜参加本试验研究的情况 说明'
    }
  }]
};

module.exports = function(lang) {
  if (lang === undefined) {
    lang = 'zh';
  }

  const result = getOptionsLang(config.options);
  result.title = config.title[lang];

  return result;
};