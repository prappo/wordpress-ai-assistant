<?php
use WPAIAssistant\Core\Api;
use WPAIAssistant\Admin\Menu;
use WPAIAssistant\Core\Template;
use WPAIAssistant\Assets\Frontend;
use WPAIAssistant\Assets\Admin;
use WPAIAssistant\Traits\Base;

defined( 'ABSPATH' ) || exit;

/**
 * Class WPAIAssistant
 *
 * The main class for the Coldmailar plugin, responsible for initialization and setup.
 *
 * @since 1.0.0
 */
final class WPAIAssistant {

	use Base;

	/**
	 * Class constructor to set up constants for the plugin.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function __construct() {
		define( 'WPAIA_VERSION', '1.0.0' );
		define( 'WPAIA_PLUGIN_FILE', __FILE__ );
		define( 'WPAIA_DIR', plugin_dir_path( __FILE__ ) );
		define( 'WPAIA_URL', plugin_dir_url( __FILE__ ) );
		define( 'WPAIA_ASSETS_URL', WPAIA_URL . '/assets' );
		define( 'WPAIA_ROUTE_PREFIX', 'wordpress-plugin-boilerplate/v1' );
	}

	/**
	 * Main execution point where the plugin will fire up.
	 *
	 * Initializes necessary components for both admin and frontend.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function init() {
		if ( is_admin() ) {
			Menu::get_instance()->init();
			Admin::get_instance()->bootstrap();
		}

		// Initialze core functionalities.
		Frontend::get_instance()->bootstrap();
		API::get_instance()->init();
		Template::get_instance()->init();

		add_action( 'init', array( $this, 'i18n' ) );
		
	}


	/**
	 * Internationalization setup for language translations.
	 *
	 * Loads the plugin text domain for localization.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function i18n() {
		load_plugin_textdomain( 'wp-ai-assistant', false, dirname( plugin_basename( __FILE__ ) ) . '/languages/' );
	}
}
