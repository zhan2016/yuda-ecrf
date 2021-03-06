import requireTrueValueValidator from './validators/requireTrueValueValidator';

function initScreeningChecklistHandlers() {
  const startDate = $('#screeningcheckdate').data('extra').start;
  if(startDate){
    $('#screeningcheckdate').datepicker('setStartDate', startDate);
  }
  $('#screeningcheckdate').datepicker('setEndDate', new Date());

  $('#screeningchecklist-form').validator({
    delay: 100,
    disable: false,
    custom: {
      customrequiretrue: requireTrueValueValidator
    }
  });

  $('#screeningchecklist-form').validator().on('invalid.bs.validator', function(){
    $('#screen-checklist-error-1').removeClass('hidden');
  });
  
  $('#screeningchecklist-form').validator().on('valid.bs.validator', function(){
    const unchedkedList = [];
    $('#screeningchecklist-form').find(':checkbox').each(function(index, el){
      if ($(el).is(':checked') === false) {
        unchedkedList.push(el);
      }
    });
    if (unchedkedList.length === 0) {
      $('#screen-checklist-error-1').addClass('hidden');
    }
  });
  $('#screeningchecklist-form').validator('validate');
}

export default initScreeningChecklistHandlers;
