<?php

namespace WPAIAssistant\Core;

use WPAIAssistant\Traits\Base;
use WPAIAssistant\Libs\API\Config;

/**
 * Class API
 *
 * Initializes and configures the API for the WPAIAssistant.
 *
 * @package WPAIAssistant\Core
 */
class API {

	use Base;

	/**
	 * Initializes the API for the WPAIAssistant.
	 *
	 * @return void
	 */
	public function init() {
		Config::set_route_file( WPAIA_DIR . '/includes/Routes/Api.php' )
			->set_namespace( 'WPAIAssistant\Api' )
			->init();
	}
}
