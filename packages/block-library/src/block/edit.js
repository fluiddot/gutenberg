/**
 * External dependencies
 */
import { partial } from 'lodash';

/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';
import { Disabled } from '@wordpress/components';
import { withSelect, withDispatch } from '@wordpress/data';
import { BlockEditorProvider } from '@wordpress/block-editor';
import { compose } from '@wordpress/compose';
import { parse, serialize } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import EditLoading from './edit-loading';
import EditUnavailable from './edit-unavailable';
import EditElement from './edit-element';
import EditContainer from './edit-container';

class ReusableBlockEdit extends Component {
	constructor( { reusableBlock } ) {
		super( ...arguments );

		this.startEditing = this.startEditing.bind( this );
		this.stopEditing = this.stopEditing.bind( this );
		this.setBlocks = this.setBlocks.bind( this );
		this.setTitle = this.setTitle.bind( this );
		this.save = this.save.bind( this );

		if ( reusableBlock ) {
			// Start in edit mode when we're working with a newly created reusable block
			this.state = {
				isEditing: reusableBlock.isTemporary,
				title: reusableBlock.title,
				blocks: parse( reusableBlock.content ),
			};
		} else {
			// Start in preview mode when we're working with an existing reusable block
			this.state = {
				isEditing: false,
				title: null,
				blocks: [],
			};
		}
	}

	componentDidMount() {
		if ( ! this.props.reusableBlock ) {
			this.props.fetchReusableBlock();
		}
	}

	componentDidUpdate( prevProps ) {
		if (
			prevProps.reusableBlock !== this.props.reusableBlock &&
			this.state.title === null
		) {
			this.setState( {
				title: this.props.reusableBlock.title,
				blocks: parse( this.props.reusableBlock.content ),
			} );
		}
	}

	startEditing() {
		const { reusableBlock } = this.props;
		this.setState( {
			isEditing: true,
			title: reusableBlock.title,
			blocks: parse( reusableBlock.content ),
		} );
	}

	stopEditing() {
		this.setState( {
			isEditing: false,
			title: null,
			blocks: [],
		} );
	}

	setBlocks( blocks ) {
		this.setState( { blocks } );
	}

	setTitle( title ) {
		this.setState( { title } );
	}

	save() {
		const { onChange, onSave } = this.props;
		const { blocks, title } = this.state;
		const content = serialize( blocks );
		onChange( { title, content } );
		onSave();

		this.stopEditing();
	}

	render() {
		const {
			convertToStatic,
			isSelected,
			reusableBlock,
			isFetching,
			isSaving,
			canUpdateBlock,
			settings,
		} = this.props;
		const { isEditing, title, blocks } = this.state;

		if ( ! reusableBlock && isFetching ) {
			return <EditLoading />;
		}

		if ( ! reusableBlock ) {
			return <EditUnavailable />;
		}

		let element = (
			<BlockEditorProvider
				settings={ settings }
				value={ blocks }
				onChange={ this.setBlocks }
				onInput={ this.setBlocks }
			>
				<EditElement />
			</BlockEditorProvider>
		);

		if ( ! isEditing ) {
			element = <Disabled>{ element }</Disabled>;
		}

		return (
			<EditContainer
				isEditing={ isEditing }
				title={ title }
				startEditing={ this.startEditing }
				setTitle={ this.setTitle }
				save={ this.save }
				stopEditing={ this.stopEditing }
				convertToStatic={ convertToStatic }
				isSelected={ isSelected }
				reusableBlock={ reusableBlock }
				isSaving={ isSaving }
				canUpdateBlock={ canUpdateBlock }
			>
				{ element }
			</EditContainer>
		);
	}
}

export default compose( [
	withSelect( ( select, ownProps ) => {
		const {
			__experimentalGetReusableBlock: getReusableBlock,
			__experimentalIsFetchingReusableBlock: isFetchingReusableBlock,
			__experimentalIsSavingReusableBlock: isSavingReusableBlock,
		} = select( 'core/editor' );
		const { canUser } = select( 'core' );
		const { __experimentalGetParsedReusableBlock, getSettings } = select(
			'core/block-editor'
		);
		const { ref } = ownProps.attributes;
		const reusableBlock = getReusableBlock( ref );

		return {
			reusableBlock,
			isFetching: isFetchingReusableBlock( ref ),
			isSaving: isSavingReusableBlock( ref ),
			blocks: reusableBlock
				? __experimentalGetParsedReusableBlock( reusableBlock.id )
				: null,
			canUpdateBlock:
				!! reusableBlock &&
				! reusableBlock.isTemporary &&
				!! canUser( 'update', 'blocks', ref ),
			settings: getSettings(),
		};
	} ),
	withDispatch( ( dispatch, ownProps ) => {
		const {
			__experimentalConvertBlockToStatic: convertBlockToStatic,
			__experimentalFetchReusableBlocks: fetchReusableBlocks,
			__experimentalUpdateReusableBlock: updateReusableBlock,
			__experimentalSaveReusableBlock: saveReusableBlock,
		} = dispatch( 'core/editor' );
		const { ref } = ownProps.attributes;

		return {
			fetchReusableBlock: partial( fetchReusableBlocks, ref ),
			onChange: partial( updateReusableBlock, ref ),
			onSave: partial( saveReusableBlock, ref ),
			convertToStatic() {
				convertBlockToStatic( ownProps.clientId );
			},
		};
	} ),
] )( ReusableBlockEdit );
