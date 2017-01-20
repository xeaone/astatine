(function () {
	'use strict';

	/*
 	version: 1.2.0
 	title: astatine
 	author: alexander elias
 */

	var Mime = {
		script: 'text/javascript, application/javascript, application/x-javascript',
		json: 'application/json, text/javascript',
		xml: 'application/xml, text/xml',
		html: 'text/html',
		text: 'text/plain',
		urlencoded: 'application/x-www-form-urlencoded'
	};

	function serialize(data) {
		var string = '';
		var name = null;

		for (name in data) {
			string = string.length > 0 ? string + '&' : string;
			string = string + encodeURIComponent(name) + '=' + encodeURIComponent(data[name]);
		}

		return string;
	}

	function formData(element) {
		var children = element.getElementsByTagName('*');
		var data = {};

		for (var i = 0, l = children.length; i < l; i++) {
			var child = children[i];
			var name = child.name;
			var type = child.type;
			var value = child.value;
			var checked = child.checked;
			var disabled = child.disabled;
			var tag = child.tagName.toLowerCase();

			if ((tag === 'input' || tag === 'textarea' || tag === 'select') && name && !disabled && type !== 'submit' && type !== 'reset' && type !== 'button' && type !== 'file') {
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

	function onSubmit(query, callback) {
		var form = typeof query === 'string' ? document.querySelector(query) : query;
		var spinner = document.createElement('div');

		spinner.classList.add('spinner');
		form.appendChild(spinner);

		form.addEventListener('submit', function (e) {
			e.preventDefault();
			callback(form, form.querySelector('[type=submit]'), spinner);
		});
	}

	function ajax(options) {
		if (!options) throw new Error('Astatine.ajax: requires options');
		if (!options.action) throw new Error('Astatine.ajax: requires options.action');
		if (!options.method) throw new Error('Astatine.ajax: requires options.method');
		if (!options.success) throw new Error('Astatine.ajax: requires options.success');
		if (!options.error) throw new Error('Astatine.ajax: requires options.error');
		if (!options.headers) options.headers = {};

		if (options.data) {
			if (options.method === 'GET') {
				options.action = options.action + '?' + serialize(options.data);
				options.data = null;
			} else {
				switch (options.requestType) {
					case 'script':
						options.contentType = Mime.script;
						break;
					case 'json':
						options.contentType = Mime.json;
						break;
					case 'xml':
						options.contentType = Mime.xml;
						break;
					case 'html':
						options.contentType = Mime.html;
						break;
					case 'text':
						options.contentType = Mime.text;
						break;
					default:
						options.contentType = Mime.urlencoded;
				}

				switch (options.responseType) {
					case 'script':
						options.accept = Mime.script;
						break;
					case 'json':
						options.accept = Mime.json;
						break;
					case 'xml':
						options.accept = Mime.xml;
						break;
					case 'html':
						options.accept = Mime.html;
						break;
					case 'text':
						options.accept = Mime.text;
						break;
				}

				if (options.contentType === Mime.json) options.data = JSON.stringify(options.data);
				if (options.contentType === Mime.urlencoded) options.data = serialize(options.data);
			}
		}

		var xhr = new XMLHttpRequest();
		xhr.open(options.method.toUpperCase(), options.action, true, options.username, options.password);

		if (options.mimeType) xhr.overrideMimeType(options.mimeType);
		if (options.withCredentials) xhr.withCredentials = options.withCredentials;

		if (options.accept) options.headers['Accept'] = options.accept;
		if (options.contentType) options.headers['Content-Type'] = options.contentType;

		if (options.headers) {
			for (var name in options.headers) {
				xhr.setRequestHeader(name, options.headers[name]);
			}
		}

		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4) {
				if (xhr.status >= 200 && xhr.status < 400) {

					return options.success(xhr);
				} else {
					return options.error(xhr);
				}
			}
		};

		xhr.send(options.data);
	}

	function submit(options) {
		if (!options) throw new Error('Astatine.submit: requires options');
		if (!options.query) throw new Error('Astatine.submit: requires options.query');
		if (!options.complete) throw new Error('Astatine.submit: requires options.complete');

		if (options.reset === null || options.reset === undefined) options.reset = true;

		onSubmit(options.query, function (form, submit, spinner) {
			if (spinner) spinner.style.display = 'block';
			if (submit) submit.style.display = 'none';

			options.data = options.data || formData(form);
			options.action = options.action || form.getAttribute('action');
			options.method = options.method || form.getAttribute('method');

			options.success = function (xhr) {
				if (spinner) spinner.style.display = 'none';
				if (submit) submit.style.display = 'block';
				if (options.reset) form.reset();
				options.complete(null, xhr, options.data);
			};

			options.error = function (xhr) {
				if (spinner) spinner.style.display = 'none';
				if (submit) submit.style.display = 'block';
				options.complete(xhr, null, options.data);
			};

			if (options.prepare) {
				var resolve = function resolve(data) {
					options.data = data;
					ajax(options);
				};
				var reject = function reject(data) {
					if (spinner) spinner.style.display = 'none';
					if (submit) submit.style.display = 'block';
					options.error(data);
				};
				options.prepare = options.prepare.bind(options, options.data, resolve, reject);
				var data = options.prepare();
				if (data) {
					options.data = data;
					ajax(options);
				}
			}
		});
	}

	function spinner(options) {
		return '\n\t.spinner {\n\t\tmargin: auto;\n\t\tdisplay: none;\n\t\twidth: ' + options.thickness + ';\n\t\theight: ' + options.thickness + ';\n\t\tborder: solid ' + options.size + ' ' + options.colorBottom + ';\n\t\tborder-top: solid ' + options.size + ' ' + options.colorTop + ';\n\t\tborder-radius: 50%;\n\t\tanimation: spin 2s linear infinite;\n\t\t-o-animation: spin 2s linear infinite;\n\t\t-ms-animation: spin 2s linear infinite;\n\t\t-moz-animation: spin 2s linear infinite;\n\t\t-webkit-animation: spin 2s linear infinite;\n\t}\n\t@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }\n\t@-o-keyframes spin { 0% { -o-transform: rotate(0deg); } 100% { -o-transform: rotate(360deg); } }\n\t@-ms-keyframes spin { 0% { -ms-transform: rotate(0deg); } 100% { -ms-transform: rotate(360deg); } }\n\t@-moz-keyframes spin { 0% { -moz-transform: rotate(0deg); } 100% { -moz-transform: rotate(360deg); } }\n\t@-webkit-keyframes spin { 0% { -webkit-transform: rotate(0deg); }100% { -webkit-transform: rotate(360deg); } }\n\t';
	}

	function addSpinnerStyle(options) {
		var head = document.head;

		var oldStyle = head.querySelector('[title=Astatine]');

		var sSpinner = spinner(options);
		var eStyle = document.createElement('style');
		var nStyle = document.createTextNode(sSpinner);

		eStyle.setAttribute('title', 'Astatine');
		eStyle.appendChild(nStyle);

		if (oldStyle) head.replaceChild(eStyle, oldStyle);else document.head.appendChild(eStyle);
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
			get: function get() {
				return this.s;
			},
			set: function set(n) {
				this.s = n;addSpinnerStyle(this);
			}
		},
		thickness: {
			get: function get() {
				return this.t;
			},
			set: function set(n) {
				this.t = n;addSpinnerStyle(this);
			}
		},
		colorTop: {
			get: function get() {
				return this.ct;
			},
			set: function set(n) {
				this.ct = n;addSpinnerStyle(this);
			}
		},
		colorBottom: {
			get: function get() {
				return this.cb;
			},
			set: function set(n) {
				this.cb = n;addSpinnerStyle(this);
			}
		}
	});

	window.At = astatine;
	window.Astatine = astatine;

	document.addEventListener('DOMContentLoaded', function () {
		addSpinnerStyle(window.Astatine.setup.spinner);
	});
})();