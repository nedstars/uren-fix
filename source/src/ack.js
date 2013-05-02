function printLinks(links) {
	// put links in data object
	var data = {groups: links};
	// use this template to format
	var template = '<h1>Comaxx Uren Fix</h1>{{#groups}}<b>{{name}}</b><ul>' +
			'{{#projects}}'+
				'<li><a href="javascript:newWindow(\'webMutate.aspx?Call=wucMutateProjectActivity.ascx&Key={{key}}&Action=Edit&ref=Urenfix\')">{{name}}</a></li>'+
			'{{/projects}}'+
		'</ul>{{/groups}}';

	// convert to html
	var html = Mustache.to_html(template, data);
	// add html
	document.getElementById('urenfix').innerHTML = html;

}

function printAddButton(links) {
	// put links in data object
	var data = {groups: links};

	// use this template to format
	var template = ''+
	'<select id="add_project_to_group" style="margin-top:8px;margin-left:10px;">'+
		'<option id="-1">'+chrome.i18n.getMessage('i18n_select_option')+'</option>'+
		'{{#groups}}<option>{{name}}</option>{{/groups}}'+
	'</select>'+
	'<img id="add_project_to_group_button"  class="add_project_to_group_button" src="Components/Images/btnNew26.gif" style="border-width:0px;padding-top:5px;margin-left:5px;" align="top" />';

	// convert to html
	var html = Mustache.to_html(template, data);

	// add html
	document.getElementById('add_block').innerHTML = html;
}

function AddProjectToGroup() {
	$(this).addClass('disabled');
	var project_id = document.getElementById('ctl00_cphContent_ctl00_txtProNo_txtTextBox').value;
	var select_box = document.getElementById('ctl00_cphContent_ctl00_ddlCustomers_ddlDropDownList');

	// project_name = [{company name}] {project description}
	var project_name = '[ ' + select_box.options[select_box.selectedIndex].text + ' ]  ' + $('#ctl00_cphContent_ctl00_txtDescription_txtTextBox').val();

	var project_key = getParameterByName('Key');
	var group_name = $('#add_project_to_group').val();

	// if no group selected -> exit
	if (group_name == chrome.i18n.getMessage('i18n_select_option')) {
		alert(chrome.i18n.getMessage('i18n_no_group_selected')+'!');
		$(this).removeClass('disabled');
		return;
	}

	// save
	chrome.storage.sync.get("Acknowledge.links", function(r) {
		var links = r["Acknowledge.links"];
		var is_succes = false;
		jQuery.each(links, function(i,val) {
			if (val.name == group_name) {
				// TODO: add check if project allready exists.
				val.projects.push ({"key":project_key,"name":project_id + ' - ' + project_name});
				is_succes = true;
			}
		});

		if (!is_succes) {
			alert(chrome.i18n.getMessage('i18n_failed_to_add')+'!');
		} else {
			storeLinks(links);
			alert(chrome.i18n.getMessage('i18n_successful_project_add', [project_name, group_name]) +'.');
		}


	});
}

function getParameterByName(name)
{
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regexS = "[\\?&]" + name + "=([^&#]*)";
	var regex = new RegExp(regexS);
	var results = regex.exec(window.location.search);
	if(results == null) {
		return "";
	} else {
		return decodeURIComponent(results[1].replace(/\+/g, " "));
	}
}


function inputToMinutes(time_input) {
	var time_in_minutes = '';
	if (time_input.indexOf(':') > 0) {
		var parts = time_input.split(":");
		time_in_minutes = parseInt(parts[0] * 60) + parseInt(parts[1]);
	} else if (time_input.indexOf(',') > 0) {
		// {h},{%} -> h}.{%}
		time_in_minutes = time_input.replace(",", ".") * 60;
	} else {
		// {h} -> {h}.0
		// {h}.{%}
		time_in_minutes = time_input * 60;
	}

	return time_in_minutes;
}

function minutesToHourString(minutes) {
	if (minutes > 0) {
		var worked_hours = Math.floor( minutes / 60);
		var worked_minutes = minutes % 60;

		if ((new String(worked_minutes)).length <2) {
			worked_minutes = '0'+worked_minutes;
		}
		return worked_hours + ':' + worked_minutes;
	} else {
		return '';
	}
}


if (filter = document.getElementById('ctl00_cphContent_trFilter')) {
	// get info here because of event listner
	var filter = filter = document.getElementById('ctl00_cphContent_trFilter');
	//var links = getLinks();

	// create new table row for data
	var	tr = document.createElement('tr');
	var	td = document.createElement('td');
	td.id = 'urenfix';
	tr.appendChild(td);
	filter.parentNode.insertBefore(tr, filter.nextSibling);


	(function() {
		chrome.storage.sync.get("Acknowledge.links", function(r) {
			var links = r["Acknowledge.links"];
			if(links == undefined) {
				links = [
					{
						name: 'Overhead',
						projects: [],
					},
					{
						name: 'Projects',
						projects: [],
					}
				];
				storeLinks(links);
			} else {
				printLinks(r["Acknowledge.links"]);
			}

		});

		// add event listener
		chrome.storage.onChanged.addListener(function(changes, namespace) {
			for (key in changes) {
				if (key == "Acknowledge.links") {
					var storageChange = changes[key];
					printLinks(storageChange.newValue);
				}
			}
		});

	})();
}

function makeValidTime(old_time) {
	var parts = old_time.split(':');
	var hours, minutes, seconds;
	if (parts.length >= 1) {
		hours = ( (parts[0] < 10 && parts[0].length < 2) ? "0" : "" ) + parts[0];
	} else {
		hours = '00';
	}


	if (parts.length >= 2) {
		minutes = ( (parts[1] < 10 && parts[1].length < 2) ? "0" : "" ) + parts[1];
	} else {
		minutes = '00';
	}


	if (parts.length >= 3) {
		seconds = ( (parts[2] < 10 && parts[2].length < 2) ? "0" : "" ) + parts[2];
	} else {
		seconds = '00';
	}

	return hours + ":" + minutes + ":" + seconds;
}

function today() {
	var today_date = new Date();
	var day = today_date.getDate();
	var month = today_date.getMonth()+1;

	if ((new String(day)).length <2) {
			day = '0'+day;
	}
	if ((new String(month)).length <2) {
			month = '0'+month;
	}

	var today_string =  day +'-'+ month +'-'+ today_date.getFullYear();

	return today_string;
}

function setNewStartTime(duration_old_in_minutes) {
	console.log('Try set time');
	var duration_in_minutes = inputToMinutes($('#ctl00_cphContent_ctl00_txtDuration_txtTextBox').val());
	var start_time_in_minutes = inputToMinutes($('#ctl00_cphContent_ctl00_txtTime_txtTextBox').val());
	var date = $('#ctl00_cphContent_ctl00_txtDate_txtTextBox').val();



	// Convert minutes to hour string
	if ((duration_old_in_minutes != '0' || start_time_in_minutes == 510) && date == today() ) {
		if (start_time_in_minutes == 510) {
			start_time_in_minutes = ((new Date()).getHours()* 60) + (new Date()).getMinutes();
		}
		// calculate new minute (start time - diff between old & new duration)
		var new_start_time_in_minutes = start_time_in_minutes - (duration_in_minutes - duration_old_in_minutes);

		var hour_string = minutesToHourString(new_start_time_in_minutes)
		console.log('new value:' + hour_string);
		$('#ctl00_cphContent_ctl00_txtTime_txtTextBox').val(hour_string);
		$('#ctl00_cphContent_ctl00_txtTime_txtTextBox_html5').val(makeValidTime(hour_string));

		duration_old_in_minutes = duration_in_minutes; // replace old value
	} else {
		console.log('No time set ' + duration_old_in_minutes + ' ' + start_time_in_minutes + ' ' +today());
	}
	return duration_old_in_minutes;
}


(function() {
	// convert time input to html5 time input.
	if (document.getElementById('ctl00_cphContent_ctl00_txtTime_txtTextBox')) {
		$('#ctl00_cphContent_ctl00_txtTime_txtTextBox').each(function() {
			var field_id = $(this).attr('id');

			// add html5 time input field
			$("<input type='time' />").attr({
					name: this.name,
					value: makeValidTime(this.value),
					id: field_id+ "_html5",
					step:900,
					autocomplete: 'off'
				}).insertBefore(this);

			// add on change object to set old value
			$("#"+field_id+ "_html5").change(function(){
				$('#'+field_id).val($(this).val());
			});
			$(this).hide();
		});

	}
	// add date picker to date field
	if (document.getElementById('ctl00_cphContent_ctl00_txtDate_txtTextBox')) {
		$.datepicker.setDefaults($.datepicker.regional[ "nl" ] );
		$( "#ctl00_cphContent_ctl00_txtDate_txtTextBox" ).datepicker();

	}

	if (document.getElementById('ctl00_cphContent_ctl00_txtDate_txtTextBox')
		&& getParameterByName('ForceAction') != ''
		&& getParameterByName('Call') == 'wucMutateProjectLineActivity.ascx') {

		$('#ctl00_cphContent_ctl00_txtDate_txtTextBox').keypress(function(e){
			// cancel enter key
			var key = e.which || e.keyCode;
			if (key == 13) { // 13 is enter
				$('#ctl00_cphContent_ctl00_txtTime_txtTextBox').focus();
				return false;
			}
		});
		$('#ctl00_cphContent_ctl00_txtTime_txtTextBox').keypress(function(e){
			// cancel enter key
			var key = e.which || e.keyCode;
			if (key == 13) { // 13 is enter
				$('#ctl00_cphContent_ctl00_txtDuration_txtTextBox').focus();
				return false;
			}
		});
		$('#ctl00_cphContent_ctl00_txtDuration_txtTextBox').keypress(function(e){
			// cancel enter key
			var key = e.which || e.keyCode;
			if (key == 13) { // 13 is enter
				$('#ctl00_cphContent_ctl00_txtDescription_txtTextBox').focus();
				return false;
			}
		});

		// set start time from config
		chrome.storage.sync.get("start_time", function(r) {
			var start_time = r["start_time"];
			if (start_time == undefined) {
				start_time= "08:30";
				storeOptions({'start_time': start_time});
			}
			$('#ctl00_cphContent_ctl00_txtTime_txtTextBox_html5').val(start_time);
			$('#ctl00_cphContent_ctl00_txtTime_txtTextBox').val(start_time);
		});

		chrome.storage.sync.get("time_increment", function(r) {
			var time_increment = r["time_increment"];
			if (time_increment == undefined) {
				time_increment= "900";
				storeOptions({'time_increment': time_increment});
			}
			$('#ctl00_cphContent_ctl00_txtTime_txtTextBox_html5').attr('step',time_increment);
		});

		// add event listener
		chrome.storage.onChanged.addListener(function(changes, namespace) {
			for (key in changes) {
				if (key == "time_increment") {
					var storageChange = changes[key];
					$('#ctl00_cphContent_ctl00_txtTime_txtTextBox_html5').attr('step',storageChange.newValue);
				}
			}
		});

		var duration_timer;
		var duration_old_in_minutes = inputToMinutes($('#ctl00_cphContent_ctl00_txtDuration_txtTextBox').val());
		$('#ctl00_cphContent_ctl00_txtDuration_txtTextBox').keyup(function(e){
			// options
			// {h} -> {h}.0
			// {h}:{m}
			// {h},{%} -> {h}.{%}
			// {h}.{%}
			clearTimeout(duration_timer); // reset timer

			var key = e.which || e.keyCode;
			if (key == 13) { // 13 is enter
				duration_old_in_minutes = setNewStartTime(duration_old_in_minutes);
				return true;
			} else if(key == 27) { // 27 is esc
				//duration_old_in_minutes= setNewStartTime(duration_old_in_minutes);
				return true;
			} else {
				duration_timer = setTimeout(function() {
					duration_old_in_minutes = setNewStartTime(duration_old_in_minutes);
				}, 1000);
			}

		});
	}
})();

(function() {
	// check if wehere on a project page.
	// if so add a menu item for adding project to quick link store.
	if(window.location.href.indexOf('wucMutateProjectActivity.ascx') > 0) {
		var add_block = document.createElement('div');
		add_block.style.float = 'left';
		add_block.id = 'add_block';
		add_block.innerHTML = ''; //div will be filled by printAddButton
		$('.wucMutateButtons').append(add_block);

		(function() {
			chrome.storage.sync.get("Acknowledge.links", function(r) {
				var links = r["Acknowledge.links"];

				if(links == undefined) {
					console.log('no Groups');
				} else {
					printAddButton(r["Acknowledge.links"]);
					// add trigger here, due to repaint options
					$('.add_project_to_group_button:not(.disabled)').live('click', AddProjectToGroup);
				}

			});

			chrome.storage.onChanged.addListener(function(changes, namespace) {
				for (key in changes) {
					if (key == "Acknowledge.links") {
						var storageChange = changes[key];
						printAddButton(storageChange.newValue);
					}
				}
			});

		})();
	}
})();

var updateScript = document.createElement('script');
updateScript.type = 'text/javascript';
updateScript.innerHTML = 'window.newWindow = function(url){window.open(url);}; ';

document.head.appendChild(updateScript);
