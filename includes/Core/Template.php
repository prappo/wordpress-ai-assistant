<?php

namespace WPAIAssistant\Core;

use WPAIAssistant\Traits\Base;

/**
 * Class Template
 *
 * Represents the Template class for WPAIAssistant.
 *
 * @package WPAIAssistant\Core
 */
class Template {

	use Base;

	const FRONTEND_TEMPLATE      = 'frontend-template.php';
	const FRONTEND_TEMPLATE_NAME = 'WPAIAssistant';
	const FRONTEND_TEMPLATE_SLUG = 'wordpress-plugin-boilerplate';

	/**
	 * Initialize the class.
	 *
	 * @return void
	 */
	public function init() {
		add_filter( 'theme_page_templates', array( $this, 'custom_template' ) );
		add_filter( 'template_include', array( $this, 'load_custom_template' ) );
	}
	/**
	 * Add custom template to theme.
	 *
	 * @param array $templates List of templates.
	 * @return array
	 */
	public function custom_template( $templates ) {
		$templates[ self::FRONTEND_TEMPLATE ] = self::FRONTEND_TEMPLATE_NAME;
		return $templates;
	}


	/**
	 * Load custom template.
	 *
	 * @param string $template Template file.
	 * @return string
	 */
	public function load_custom_template( $template ) {
		if ( get_page_template_slug() === self::FRONTEND_TEMPLATE ) {
			$template_file_dir = WPAIA_DIR . 'views/templates/' . self::FRONTEND_TEMPLATE;

			if ( file_exists( $template_file_dir ) ) {
				return $template_file_dir;
			}
		}
		return $template;
	}
}
