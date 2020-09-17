/**
 * WordPress dependencies
 */
import { ToolbarButton, ToolbarGroup } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { BlockControls } from '@wordpress/block-editor';

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
		<>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton onClick={ convertToStatic }>
						{ __( 'Convert to regular blocks' ) }
					</ToolbarButton>
				</ToolbarGroup>
			</BlockControls>
			<div className="block-library-block__reusable-block-container">
				{ ( isSelected || isEditing ) && (
					<ReusableBlockEditPanel
						isEditing={ isEditing }
						title={ title !== null ? title : reusableBlock.title }
						isSaving={ isSaving && ! reusableBlock.isTemporary }
						isEditDisabled={ ! canUpdateBlock }
						onEdit={ startEditing }
						onChangeTitle={ setTitle }
						onSave={ save }
						onCancel={ stopEditing }
					/>
				) }
				{ children }
			</div>
		</>
	);
}

export default EditContainer;
