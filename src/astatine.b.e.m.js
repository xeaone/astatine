/*
	version: 1.1.2
	title: astatine
	author: alexander elias
*/

function serialize (data) {
	var string = '';
	var name = null;

	for (name in data) {
		string = string.length > 0 ? string + '&' : string;
		string = string + encodeURIComponent(name) + '=' + encodeURIComponent(data[name]);
	}

	return string;
}

function formData (element) {
	var children = element.querySelectorAll('input, textarea, select');
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
			} else if (type === 'select-one' || type === 'select-multiple') {
				data[name] = [];

				for (var c = 0, t = child.selectedOptions.length; c < t; c++) {
					data[name].push(child.selectedOptions[c].value);
				}

				data[name] = data[name].join(', ');
			} else {
				data[name] = value;
			}
		}

	}

	return data;
}

function ajax (options) {
	if (!options) throw new Error('Astatine.ajax: requires options');

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
		var name = null;
		for (name in options.headers) {
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

function onSubmit (query, callback) {
	window.addEventListener('DOMContentLoaded', function () {
		var form = typeof query === 'string' ? document.querySelector(query) : query;
		var spinner = document.createElement('div');

		spinner.classList.add('spinner');
		form.appendChild(spinner);

		form.addEventListener('submit', function (e) {
			e.preventDefault();
			callback(form, form.querySelector('[type=submit]'), spinner);
		});
	});
}

function submit (options) {
	if (!options) throw new Error('Astatine.submit: requires options');
	if (!options.query) throw new Error('Astatine.submit: requires options.query');

	onSubmit(options.query, function (form, submit, spinner) {
		if (spinner) spinner.style.display = 'block';
		if (submit) submit.style.display = 'none';

		options.data = options.data || formData(form);
		options.action = options.action || form.getAttribute('action');
		options.method = options.method || form.getAttribute('method');
		options.enctype = options.enctype || form.getAttribute('enctype');
		options.headers = options.headers || { 'Content-Type': options.enctype };

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

		if (options.prepare) {
			options.data = options.prepare(options.data) || options.data;
		}

		if (typeof options.data === 'function') {
			options.data(function (data) {
				options.data = data;
				ajax(options);
			});
		} else {
			ajax(options);
		}

	});
}

function spinner (options) {
	return `
	.spinner {
		margin: auto;
		display: none;
		width: ${options.thickness};
		height: ${options.thickness};
		border: solid ${options.size} ${options.colorBottom};
		border-top: solid ${options.size} ${options.colorTop};
		border-radius: 50%;
		animation: spin 2s linear infinite;
		-o-animation: spin 2s linear infinite;
		-ms-animation: spin 2s linear infinite;
		-moz-animation: spin 2s linear infinite;
		-webkit-animation: spin 2s linear infinite;
	}
	@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
	@-o-keyframes spin { 0% { -o-transform: rotate(0deg); } 100% { -o-transform: rotate(360deg); } }
	@-ms-keyframes spin { 0% { -ms-transform: rotate(0deg); } 100% { -ms-transform: rotate(360deg); } }
	@-moz-keyframes spin { 0% { -moz-transform: rotate(0deg); } 100% { -moz-transform: rotate(360deg); } }
	@-webkit-keyframes spin { 0% { -webkit-transform: rotate(0deg); }100% { -webkit-transform: rotate(360deg); } }
	`;
}

function addSpinnerStyle (options) {
	var head = document.head;

	var oldStyle = head.querySelector('[title=Astatine]');

	var sSpinner = spinner(options);
	var eStyle = document.createElement('style');
	var nStyle = document.createTextNode(sSpinner);

	eStyle.setAttribute('title', 'Astatine');
	eStyle.appendChild(nStyle);

	if (oldStyle) head.replaceChild(eStyle, oldStyle);
	else document.head.appendChild(eStyle);
}

var astatine = {
	setup: {
		spinner: {
			s: '3px',
			t: '15px',
			ct: 'darkgray',
			cb: 'lightgray'
		}
	},
	ajax: ajax,
	submit: submit,
	formData: formData,
	serialize: serialize
};

Object.defineProperties(astatine.setup.spinner, {
	size: {
		get: function () { return this.s; },
		set: function (n) { this.s = n; addSpinnerStyle(this); }
	},
	thickness: {
		get: function () { return this.t; },
		set: function (n) { this.t = n; addSpinnerStyle(this); }
	},
	colorTop: {
		get: function () { return this.ct; },
		set: function (n) { this.ct = n; addSpinnerStyle(this); }
	},
	colorBottom: {
		get: function () { return this.cb; },
		set: function (n) { this.cb = n; addSpinnerStyle(this); }
	}
});

window.At = astatine;
window.Astatine = astatine;

document.addEventListener('DOMContentLoaded', function () {
	addSpinnerStyle(window.Astatine.setup.spinner);
});
