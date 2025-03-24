<?php

namespace WPAIAssistant\Controllers\Settings;

class Actions {
    public function save( \WP_REST_Request $request ) {
        $data = $request->get_params();
        $settings = get_option( 'wpaia_settings', array() );
        $settings = array_merge( $settings, $data );
        update_option( 'wpaia_settings', $settings );
        return new \WP_REST_Response( $settings, 200 );
    }

    public function get( \WP_REST_Request $request ) {
        $settings = get_option( 'wpaia_settings', array() );
        return new \WP_REST_Response( $settings, 200 );
    }
}
