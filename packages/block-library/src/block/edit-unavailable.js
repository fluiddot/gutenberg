/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Placeholder } from '@wordpress/components';

function EditUnavailable() {
	return (
		<Placeholder>
			{ __( 'Block has been deleted or is unavailable.' ) }
		</Placeholder>
	);
}

export default EditUnavailable;
