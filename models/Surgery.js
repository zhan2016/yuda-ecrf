const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const mongodbErrorHandler = require('mongoose-mongodb-errors');

const surgerySchema = new Schema({
  case: {
    type: String,
    ref: 'Case',
    required: 'You must supply a caseid'
  },
  /**
   * SURGERY
   */
  // 手术日期
  surgerydtc: {
    type: Date
  },
  // C-REX LapAid型号
  device_1: Number,
  // C-REX DMH/DMHC型号
  device_2: Number,
  // 肠切除术-Descending colon
  surgery_1: Boolean,
  // 肠切除术-Sigmoid colon
  surgery_2: Boolean,
  // 肠切除术-Rectum
  surgery_3: Boolean,
  // 肿瘤距离肛门
  surgery_4: Number,
  // 肿瘤大小-长度(cm)
  surgery_5: Number,
  // 肿瘤大小-宽度(cm)
  surgery_6: Number,
  // 肿瘤浸润范围
  surgery_7: String,
  // 吻合方式
  surgery_8: Number,
  // 手术方式
  surgery_9: Number,
  // 术中吻合口完整性压力
  surgery_10: Number,
  // 肛门外监测导管长度(若使用DMC)
  surgery_11: Number,
  // 手术时间
  surgery_12: Number,
  // 术中出血量
  surgery_13: Number,
  // 不良事件
  surgery_14: Boolean
});

surgerySchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('Surgery', surgerySchema);
