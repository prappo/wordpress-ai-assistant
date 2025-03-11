<?php

namespace WPAIAssistant\Admin;

use WPAIAssistant\Traits\Base;

/**
 * Class Menu
 *
 * Represents the admin menu management for the WPAIAssistant plugin.
 *
 * @package WPAIAssistant\Admin
 */
class Menu {

	use Base;

	/**
	 * Parent slug for the menu.
	 *
	 * @var string
	 */
	private $parent_slug = 'wp-ai-assistant';

	/**
	 * Initializes the admin menu.
	 *
	 * @return void
	 */
	public function init() {
		// Hook the function to the admin menu.
		add_action( 'admin_menu', array( $this, 'menu' ) );

		// Disable all admin notices.
		add_action( 'admin_init', array( $this, 'disable_admin_notices' ) );
	}

	/**
	 * Adds a menu to the WordPress admin dashboard.
	 *
	 * @return void
	 */
	public function menu() {

		add_menu_page(
			__( 'AI Assistant', 'wp-ai-assistant' ),
			__( 'AI Assistant', 'wp-ai-assistant' ),
			'manage_options',
			$this->parent_slug,
			array( $this, 'admin_page' ),
			'dashicons-businessman',
			3
		);

		$plugin_url = admin_url( '/admin.php?page=' . $this->parent_slug );

		$current_page = get_admin_page_parent();

		if ( $current_page === $this->parent_slug ) {
			$plugin_url = '';
		}

		$submenu_pages = array(
			array(
				'parent_slug' => $this->parent_slug,
				'page_title'  => __( 'Chat', 'wp-ai-assistant' ),
				'menu_title'  => __( 'Chat', 'wp-ai-assistant' ),
				'capability'  => 'manage_options',
				'menu_slug'   => $this->parent_slug,
				'function'    => array( $this, 'admin_page' ), // Uses the same callback function as parent menu.
			),

			array(
				'parent_slug' => $this->parent_slug,
				'page_title'  => __( 'Settings', 'wp-ai-assistant' ),
				'menu_title'  => __( 'Settings', 'wp-ai-assistant' ),
				'capability'  => 'manage_options',
				'menu_slug'   => $plugin_url . '/#/settings',
				'function'    => null, // Uses the same callback function as parent menu.
			),
		);

		$plugin_submenu_pages = apply_filters( 'wpaia_submenu_pages', $submenu_pages );

		foreach ( $plugin_submenu_pages as $submenu ) {

			add_submenu_page(
				$submenu['parent_slug'],
				$submenu['page_title'],
				$submenu['menu_title'],
				$submenu['capability'],
				$submenu['menu_slug'],
				$submenu['function']
			);
		}
	}

	/**
	 * Disable all admin notices.
	 *
	 * @return void
	 */
	public function disable_admin_notices() {
		// Check if we're on one of our plugin's admin pages.
		if ( isset( $_GET['page'] ) && strpos( $_GET['page'], $this->parent_slug ) === 0 ) {
			// Remove all admin notices.
			remove_all_actions( 'admin_notices' );
			remove_all_actions( 'all_admin_notices' );

			add_filter( 'admin_footer_text', '__return_empty_string', 11 );
			add_filter( 'update_footer', '__return_empty_string', 11 );

			// Add CSS to hide any notices that might be added after our hook.
			echo '<style>
				.notice, .updated, .update-nag, .error, .warning { 
					display: none !important; 
				}
			</style>';
		}
	}

	/**
	 * Callback function for the main "MyPlugin" menu page.
	 *
	 * @return void
	 */
	public function admin_page() {
		?>
		<div id="myplugin" class="myplugin-app"></div>
		<?php
	}
}
