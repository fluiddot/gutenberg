/**
 * External dependencies
 */
import { Text, View } from 'react-native';
import { partial } from 'lodash';

/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';
import { Spinner, Disabled } from '@wordpress/components';
import { withSelect, withDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { BlockEditorProvider, BlockList } from '@wordpress/block-editor';
import { compose } from '@wordpress/compose';
import { parse } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import styles from './editor.scss';

class ReusableBlockEdit extends Component {
	constructor( { reusableBlock } ) {
		super( ...arguments );

		this.setBlocks = this.setBlocks.bind( this );

		if ( reusableBlock ) {
			// Start in edit mode when we're working with a newly created reusable block
			this.state = {
				// Since edition is not supported yet isEditing is always false
				isEditing: false,
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

	setBlocks( blocks ) {
		this.setState( { blocks } );
	}

	render() {
		const { isSelected, reusableBlock, isFetching, settings } = this.props;
		const { isEditing, title, blocks } = this.state;

		if ( ! reusableBlock && isFetching ) {
			return <Spinner />;
		}

		if ( ! reusableBlock ) {
			return (
				<Text>
					{ __( 'Block has been deleted or is unavailable.' ) }
				</Text>
			);
		}

		let element = (
			<BlockEditorProvider
				settings={ settings }
				value={ blocks }
				onChange={ this.setBlocks }
				onInput={ this.setBlocks }
			>
				<BlockList withFooter={ false } />
			</BlockEditorProvider>
		);

		if ( ! isEditing ) {
			element = <Disabled>{ element }</Disabled>;
		}

		return (
			<View>
				{ isSelected && <Text style={ styles.title }>{ title }</Text> }
				{ element }
			</View>
		);
	}
}

export default compose( [
	withSelect( ( select, ownProps ) => {
		const {
			__experimentalGetReusableBlock: getReusableBlock,
			__experimentalIsFetchingReusableBlock: isFetchingReusableBlock,
		} = select( 'core/editor' );
		const { getSettings } = select( 'core/block-editor' );
		const { ref } = ownProps.attributes;
		const reusableBlock = getReusableBlock( ref );

		return {
			reusableBlock,
			isFetching: isFetchingReusableBlock( ref ),
			settings: getSettings(),
		};
	} ),
	withDispatch( ( dispatch, ownProps ) => {
		const {
			__experimentalFetchReusableBlocks: fetchReusableBlocks,
		} = dispatch( 'core/editor' );
		const { ref } = ownProps.attributes;

		return {
			fetchReusableBlock: partial( fetchReusableBlocks, ref ),
		};
	} ),
] )( ReusableBlockEdit );
