(function() {
	'use strict';

	function ajax (options) {
		if (!options) throw new Error('ajax: requires options');

		if (!options.action) options.action = window.location.pathname;
		if (!options.enctype) options.enctype = 'text/plain';
		if (!options.method) options.method = 'GET';
		else options.method = options.method.toUpperCase();

		if (options.data) {
			if (options.method === 'GET') {
				options.action = options.action + '?' + serialize(options.data);
				options.data = null;
			} else {
				if (options.enctype.search('application/x-www-form-urlencoded') !== -1) options.data = serialize(options.data);
				else if (options.enctype.search('application/json') !== -1) options.data = JSON.stringify(options.data);
			}
		}

		var xhr = new XMLHttpRequest();
		xhr.open(options.method, options.action, true, options.username, options.password);

		if (options.mimeType) xhr.overrideMimeType(options.mimeType);
		if (options.withCredentials) xhr.withCredentials = options.withCredentials;

		if (options.headers) {
			for (var name in options.headers) {
				xhr.setRequestHeader(name, options.headers[name]);
			}
		}

		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4) {
				if (xhr.status >= 200 && xhr.status < 300) {
					if (options.success) return options.success(xhr);
				} else {
					if (options.error) return options.error(xhr);
				}
			}
		};

		xhr.send(options.data);
	}

	function submit (options) {
		if (!options) throw new Error('submit: missing options');
		if (!options.query) throw new Error('submit: missing options.query');

		onSubmit(options.query, function (form, submit, spinner) {
			if (spinner) spinner.style.display = 'block';
			if (submit) submit.style.display = 'none';

			options.data = options.data || formData(form);
			options.action = options.action || form.getAttribute('action');
			options.method = options.method || form.getAttribute('method');
			options.enctype = options.enctype || form.getAttribute('enctype');
			options.headers = options.headers || { 'Content-Type': options.enctype };

			if (options.prepare) options.prepare(options.data);

			options.success = function (xhr) {
				if (spinner) spinner.style.display = 'none';
				if (submit) submit.style.display = 'block';

				form.reset();
				if (options.complete) return options.complete(null, xhr);
			};

			options.error = function (xhr) {
				if (spinner) spinner.style.display = 'none';
				if (submit) submit.style.display = 'block';

				options.data = null;
				if (options.complete) return options.complete(xhr, null);
			};

			ajax(options);
		});
	}

	function serialize (data) {
		var string = '';

		for (var name in data) {
			string = string.length > 0 ? string + '&' : string;
			string = string + encodeURIComponent(name) + '=' + encodeURIComponent(data[name]);
		}

		return string;
	}

	function formData (element) {
		var children = element.querySelectorAll('input, textarea');
		var data = {};

		for (var i = 0, l = children.length; i < l; i++) {
			var child = children[i];
			var name = child.name;
			var type = child.type;
			var value = child.value;
			var checked = child.checked;
			var disabled = child.disabled;

			if (name && !disabled && type !== 'submit' && type !== 'reset' && type !== 'button' && type !== 'file') {
				if (type === 'checkbox') {
					data[name] = checked;
				} else if (type === 'radio') {
					if (checked) data[name] = value;
				} else {
					data[name] = value;
				}
			}

		}

		return data;
	}

	/*
		internal
	*/

	function onSubmit (query, callback) {
		var element = document.querySelector(query);
		var spinner = document.createElement('div');

		spinner.classList.add('spinner');
		element.appendChild(spinner);

		element.addEventListener('submit', function (e) {
			e.preventDefault();

			var form = e.target;
			var submit =  form.querySelector('[type=submit]');

			return callback(form, submit, spinner);
		});
	}

	function spinner (options) {
		return '.spinner {'+
			'margin: auto;'+
			'display: none;'+
			'width: '+ options.thickness + ';'+
			'height: '+ options.thickness + ';'+
			'border: '+ options.size +' solid '+ options.colorBottom + ';'+
			'border-top: '+ options.size + ' solid '+ options.colorTop + ';'+
			'border-radius: 50%;'+
			'animation: spin 2s linear infinite;'+
			'-o-animation: spin 2s linear infinite;'+
			'-moz-animation: spin 2s linear infinite;'+
			'-webkit-animation: spin 2s linear infinite; }'+
		'@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }'+
		'@-o-keyframes spin { 0% { -o-transform: rotate(0deg); } 100% { -o-transform: rotate(360deg); } }'+
		'@-moz-keyframes spin { 0% { -moz-transform: rotate(0deg); } 100% { -moz-transform: rotate(360deg); } }'+
		'@-webkit-keyframes spin { 0% { -webkit-transform: rotate(0deg); }100% { -webkit-transform: rotate(360deg); } }';
	}

	window.At = {
		setup: {
			spinner: {
				size: '3px',
				thickness: '15px',
				colorTop: 'darkgray',
				colorBottom: 'lightgray'
			}
		},
		ajax: ajax,
		submit: submit,
		formData: formData,
		serialize: serialize,
	};

	document.addEventListener('load', function () {
		var style = document.createElement('style');
		style.innerText = spinner(window.At.setup.spinner);
		document.head.appendChild(style);
	});

}());
