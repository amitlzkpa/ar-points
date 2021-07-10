var MExNServer = require("@ttcorestudio/mexn-server");
// var Promise = MExNServer.modules.bluebird;
// var async = require('async');



module.exports = function(fileSchema) {

	var libLambda = MExNServer.server.lib.lambda;

	fileSchema.statics.getSizes = function() {
		return [{
			name: "sm",
			dim: 200
		}, {
			name: "sm-sq",
			width: 200,
			height: 200
		}, {
			name: "md",
			dim: 600
		}, {
			name: "md-sq",
			width: 600,
			height: 600
		}, {
			name: "lg",
			dim: 1024
		}];
	};

	fileSchema.methods.getSizeKey = function(name) {
		var file = this;
		return file.s3Key + "-" + name;
	};

	fileSchema.methods.looksLikeImage = function() {
		var file = this;
		return file.type.indexOf('image') !== -1;
	}

	// This utility image is used by mean-lib: if it exists, it will delete all
	// attached S3 keys per this function when running File.deleteBySearch or File.deleteByIds
	// Otherwise only deletes file.s3Key.
	fileSchema.methods.getAllKeys = function() {
		var file = this;
		var File = this.constructor;
		var arr = [file.s3Key];
		if (file.looksLikeImage()) {
			File.getSizes().forEach(function(size) {
				arr.push(file.getSizeKey(size.name));
			});
		}
		return arr;
	};

	fileSchema.methods.createThumbnailsIfNeeded = function() {

		var file = this;
		var File = this.constructor;

		if (!file.looksLikeImage()) return;

		libLambda.createAuthInstance().then(function(lambda) {

			File.getSizes().forEach(function(size) {

				var args = {
					bucket: process.env.AWS_BUCKET,
					key: file.s3Key,
					newKey: file.getSizeKey(size.name)
				};

				if (size.dim) {
					args.dim = size.dim;
				} else {
					args.width = size.width;
					args.height = size.height;
				}

				var params = {
					FunctionName: "imageSizeAndSave",
					InvocationType: "Event",
					Payload: JSON.stringify(args)
				};

				lambda.invoke(params, function(err, data) {
					console.log("thumb result", size.name, err, data);
				});

			});


		});

	};

	fileSchema.methods.getThumbnail = function() {

	};

};
