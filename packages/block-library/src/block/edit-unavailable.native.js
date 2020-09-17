/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * External dependencies
 */
import { Text } from 'react-native';

function EditUnavailable() {
	return <Text>{ __( 'Block has been deleted or is unavailable.' ) }</Text>;
}

export default EditUnavailable;
