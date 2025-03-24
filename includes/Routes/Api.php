<?php
/**
 * WPAIAssistant Routes
 *
 * Defines and registers custom API routes for the WPAIAssistant using the Haruncpi\WpApi library.
 *
 * @package WPAIAssistant\Routes
 */

namespace WPAIAssistant\Routes;

use WPAIAssistant\Libs\API\Route;

Route::prefix(
	WPAIA_ROUTE_PREFIX,
	function ( Route $route ) {

		// Settings routes.
		$route->post( '/settings/save', '\WPAIAssistant\Controllers\Settings\Actions@save' );
		$route->get( '/settings/get', '\WPAIAssistant\Controllers\Settings\Actions@get' );

		// Posts routes.
		$route->get( '/posts/get', '\WPAIAssistant\Controllers\Posts\Actions@get_all_posts' );
		$route->get( '/posts/get/{id}', '\WPAIAssistant\Controllers\Posts\Actions@get_post' );
		// Allow hooks to add more custom API routes.
		do_action( 'wpaia_api', $route );
	}
);
