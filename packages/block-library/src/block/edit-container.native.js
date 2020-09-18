/**
 * External dependencies
 */
import { View } from 'react-native';

/**
 * Internal dependencies
 */
import ReusableBlockEditPanel from './edit-panel';

function EditContainer( {
	children,
	convertToStatic,
	isSelected,
	reusableBlock,
	isSaving,
	canUpdateBlock,
	isEditing,
	title,
	startEditing,
	setTitle,
	save,
	stopEditing,
} ) {
	return (
		<View>
			{ ( isSelected || isEditing ) && (
				<ReusableBlockEditPanel
					title={ title !== null ? title : reusableBlock.title }
				/>
			) }
			{ children }
		</View>
	);
}

export default EditContainer;
