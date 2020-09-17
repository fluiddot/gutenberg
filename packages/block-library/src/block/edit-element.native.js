/**
 * WordPress dependencies
 */
import { BlockList } from '@wordpress/block-editor';

function EditElement() {
	return <BlockList withFooter={ false } />;
}

export default EditElement;
