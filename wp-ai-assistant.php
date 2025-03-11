<?php
/**
 * Plugin Name: WordPress AI Assistant
 * Description: A WordPress AI Assistant plugin.
 * Author: Prappo
 * Author URI: https://github.com/prappo
 * License: GPLv2
 * Version: 1.0.0
 * Text Domain: wp-ai-assistant
 * Domain Path: /languages
 *
 * @package WordPress AI Assistant
 */

use WPAIAssistant\Core\Install;

defined( 'ABSPATH' ) || exit;

require_once plugin_dir_path( __FILE__ ) . 'vendor/autoload.php';
require_once plugin_dir_path( __FILE__ ) . 'plugin.php';

/**
 * Initializes the WPAIAssistant plugin when plugins are loaded.
 *
 * @since 1.0.0
 * @return void
 */
function wp_ai_assistant_init() {
	WPAIAssistant::get_instance()->init();
}

// Hook for plugin initialization.
add_action( 'plugins_loaded', 'wp_ai_assistant_init' );

// Hook for plugin activation.
register_activation_hook( __FILE__, array( Install::get_instance(), 'init' ) );
