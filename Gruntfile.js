module.exports = function(grunt) {
	var shell = require('shelljs');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
	});

	
	grunt.registerTask('default', 'Log some stuff.', function() {
		ls = getLocalsettings();
		grunt.log.write('localsettings successfully read URL=' + ls.url).ok();
	});

	/*
	* Installing WP
	*/
	grunt.registerTask('wp-install', '', function() {
		ls = getLocalsettings();
		wpcmd = 'wp --path=' + ls.wppath + ' --allow-root ';

		shell.mkdir('-p', ls.wppath);

		if(!shell.test('-e', ls.wppath + '/wp-config.php')) {
			shell.exec(wpcmd + 'core download --force');
			shell.exec(wpcmd + 'core config --dbname=' + ls.dbname + ' --dbuser=' + ls.dbuser + ' --dbpass=' + ls.dbpass + ' --quiet');
			shell.exec(wpcmd + 'core install --url=' + ls.url + ' --title="WordPress App" --admin_name=' + ls.wpuser + ' --admin_email="admin@local.dev" --admin_password="' + ls.wppass + '"');
		} else {
			grunt.log.write('Wordpress is already installed').ok();
		}
	});

	/*
	* Setting up WP
	* 
	*/
	grunt.registerTask('wp-setup', '', function() {
		ls = getLocalsettings();
		wpcmd = 'wp --path=' + ls.wppath + ' --allow-root ';
		
		// some standard plugins
		stdplugins = ['google-analyticator','wp-cfm'];
		for(i=0;i<stdplugins.length;i++) {
			name = stdplugins[i];		
			shell.exec(wpcmd + 'plugin install --activate ' + name);
		}

		shell.exec(wpcmd + 'option update blogname "New blog title"');
		shell.exec(wpcmd + 'option update blogdescription "experimental tagline"');
		shell.exec(wpcmd + 'option update posts_per_page "20"');

	})

	grunt.registerTask('wp-export', '', function() {
		ls = getLocalsettings();
		wpcmd = 'wp --path=' + ls.wppath + ' --allow-root ';
		pwd = shell.pwd();

		shell.mkdir('-p', pwd + '/config');

		// push settings from DB to file
		src = ls.wppath + '/wp-content/config/settings.json';
		trg = pwd + '/config/settings.json';
		shell.exec(wpcmd + 'config push settings');
		shell.cp('-f', src, trg);
	});

	grunt.registerTask('wp-import', '', function() {
		ls = getLocalsettings();
		wpcmd = 'wp --path=' + ls.wppath + ' --allow-root ';
		pwd = shell.pwd();

		shell.mkdir('-p', ls.wppath + '/wp-content/config');
		
		src = pwd + '/config/settings.json';
		trg = ls.wppath + '/wp-content/config/settings.json';
		shell.cp('-f', src, trg);
		shell.exec(wpcmd + 'config pull settings');
	});


	function getLocalsettings(test) {
		ls = grunt.file.readJSON('localsettings.json');
		if(ls.wppath === undefined) ls.wppath = shell.pwd() + '/www/wordpress-default';
		return ls;
	}
};
