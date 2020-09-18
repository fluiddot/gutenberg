/**
 * WordPress dependencies
 */
import { BlockList, WritingFlow } from '@wordpress/block-editor';

function EditElement() {
	return (
		<WritingFlow>
			<BlockList />
		</WritingFlow>
	);
}

export default EditElement;
