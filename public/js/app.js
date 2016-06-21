$(function(){
  $('.modal-trigger').leanModal();

  $('.add_question').click(function(){
    $('.questions').append('<div class="input-field"><input name="questions[]" id="question1" type="text" class="validate"><label for="name">Add a question</label></div>');
  });

  $('#answer_form').submit(function() {
        $('input[name,value=""]').attr('name', '');
  });

  $('#schedule_form').submit(function(e) {
      if($('.days:checked').length <= 0)
      {
        var $toastContent = $('<span>You must atlease select a day</span>');
        Materialize.toast($toastContent, 5000);
        e.preventDefault();
      }
  });

  $('.pick-a-time').lolliclock({autoclose:true});
  $('select').material_select();


    function intToFloat(num, decPlaces) { return num.toFixed(decPlaces); }
    var timeZone = -((new Date().getTimezoneOffset())/60);
    timeZone = intToFloat(timeZone, 1).toString();
    $('select').val(timeZone);
    $('select').material_select();

    $('select#hours').material_select();

});
