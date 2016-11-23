# Astatine
Astatine || At - Simple Small Ajax and HTML Form Library. Library entry point. Globally available by using **Astatine** or **At**.


## Overview
- 3KB uncompressed
- Install `npm install astatine`
- Link `astatine.min.js`
- ES5 browsers and up. (Probably older ones but who cares about those)


## API


### Astatine.setup.spinner
Sets up spinner color, thickness, and size. Defaults are listed bellow. Do this before any Astatine or At operations.

##### Example
```JavaScript
Astatine.setup.spinner.size = '3px';
Astatine.setup.spinner.thickness = '15px';
Astatine.setup.spinner.colorTop = 'darkgray';
Astatine.setup.spinner.colorBottom = 'lightgray';
```


### Astatine.submit(options)
Submit form. Error and Success are your XHR response. Creates a spinner with the class `.spinner` and hides `type=submit`.

##### Features
- `application/json` automatically stringiifed to json string.
- `application/x-www-form-urlencoded` automatically serialized to url params.
- `radio` will only appear if it is checked.
- `checkbox` will either be `true` or `false`.
- `type="submit"` will automatically hide.

##### Options
The options object accepts all items form the `Astatine.ajax` method.

- **query** `String | Element` Query selector or element.
- **prepare** `Function` Parameters `data` the return value can be one of the following:
	- **Function** Parameters `resolve/callback` to be used for async methods
	- **Object** The form data object.
	- **Null** If the return value is null or undefined the form data object will be used.
- **complete** `Function` Parameters `error, success`

##### Example
```HTML
<form class="form" method="post" enctype="application/json" action="/post/path">
	<input type="text" name="name" placeholder="Name" required>
	<input type="submit" value="Submit"/>
</form>
```
```JavaScript
Astatine.submit({
	query: '.form',
	prepare: function (data) {
		data.foo = 'bar'; // manipulate data before send

		return function (resolve) { // async
			resolve(data);
		}
	},
	complete: function (error, success) {
		if (error) console.log(error);
		else console.log(success);
	}
});
```


### Astatine.ajax(options)
Ajax is a lower level utility function that allows for more control but less features than the submit method.

##### Options
- **enctype**: `String` Overwrites 'content-type' in headers
- **method**: `String` Valid methods get, post, put, and delete
- **action**: `String` Resource url
- **username**: `String`
- **password**: `String`
- **mimeType**: `String` Overwrites return type
- **data**: `Object` If method is `GET` than data is concatenated to the `action/url` as parameters
- **headers**: `Object`
- **success**: `Function`
- **error**: `Function`

##### Example
```JavaScript
Astatine.ajax({
	data: { name: 'stuff' }, // params or data
	method: 'get', // post put delete
	action: '/examples/index.html',
	success: function (xhr) {
		console.log(xhr);
	},
	error: function (xhr) {
		console.log(xhr);
	}
});
```


### Astatine.formData(element)

##### Parameter
- `Object` DOM element

##### Example
```JavaScript
var objectData = Astatine.formData(element);
```


### Astatine.serialize(data)

##### Parameter
- `Object` Single level deep key value pare

##### Example
```JavaScript
var stringData = Astatine.serialize(data);
```


## License
Licensed Under MPL 2.0
Copyright 2016 [Alexander Elias](https://github.com/AlexanderElias/)
