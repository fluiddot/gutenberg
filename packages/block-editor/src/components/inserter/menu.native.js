/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * External dependencies
 */
import {
	FlatList,
	View,
	TouchableHighlight,
	TouchableWithoutFeedback,
	Dimensions,
	Text,
} from 'react-native';
import { pick } from 'lodash';

/**
 * WordPress dependencies
 */
import { Component, render } from '@wordpress/element';
import { createBlock, rawHandler } from '@wordpress/blocks';
import { withDispatch, withSelect } from '@wordpress/data';
import { withInstanceId, compose } from '@wordpress/compose';
import {
	BottomSheet,
	BottomSheetConsumer,
	SegmentedControl,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import styles from './style.scss';
import MenuItem from './menu-item.native';

const MIN_COL_NUM = 3;
const TABS = [ __( 'Child Blocks' ), __( 'Reusable blocks' ) ];

export class InserterMenu extends Component {
	constructor() {
		super( ...arguments );

		this.onClose = this.onClose.bind( this );
		this.onLayout = this.onLayout.bind( this );
		this.onChangeTab = this.onChangeTab.bind( this );
		this.renderItem = this.renderItem.bind( this );
		this.renderBlocksTab = this.renderBlocksTab.bind( this );
		this.renderReusableBlocksTab = this.renderReusableBlocksTab.bind(
			this
		);
		this.state = {
			numberOfColumns: MIN_COL_NUM,
			tab: 0,
		};

		Dimensions.addEventListener( 'change', this.onLayout );
	}

	componentDidMount() {
		this.props.showInsertionPoint();
		this.props.fetchReusableBlocks();
	}

	componentWillUnmount() {
		this.props.hideInsertionPoint();
		Dimensions.removeEventListener( 'change', this.onLayout );
	}

	calculateMinItemWidth( bottomSheetWidth ) {
		const { paddingLeft, paddingRight } = styles.columnPadding;
		return (
			( bottomSheetWidth - 2 * ( paddingLeft + paddingRight ) ) /
			MIN_COL_NUM
		);
	}

	calculateItemWidth() {
		const {
			paddingLeft: itemPaddingLeft,
			paddingRight: itemPaddingRight,
		} = styles.modalItem;
		const { width: itemWidth } = styles.modalIconWrapper;
		return itemWidth + itemPaddingLeft + itemPaddingRight;
	}

	calculateColumnsProperties() {
		const bottomSheetWidth = BottomSheet.getWidth();
		const { paddingLeft, paddingRight } = styles.columnPadding;
		const itemTotalWidth = this.calculateItemWidth();
		const containerTotalWidth =
			bottomSheetWidth - ( paddingLeft + paddingRight );
		const numofColumns = Math.floor( containerTotalWidth / itemTotalWidth );

		if ( numofColumns < MIN_COL_NUM ) {
			return {
				numOfColumns: MIN_COL_NUM,
				itemWidth: this.calculateMinItemWidth( bottomSheetWidth ),
				maxWidth: containerTotalWidth / MIN_COL_NUM,
			};
		}
		return {
			numOfColumns: numofColumns,
			maxWidth: containerTotalWidth / numofColumns,
		};
	}

	onClose() {
		// if should replace but didn't insert any block
		// re-insert default block
		if ( this.props.shouldReplaceBlock ) {
			this.props.insertDefaultBlock();
		}
		this.props.onDismiss();
	}

	onLayout() {
		const {
			numOfColumns,
			itemWidth,
			maxWidth,
		} = this.calculateColumnsProperties();
		const numberOfColumns = numOfColumns;

		this.setState( { numberOfColumns, itemWidth, maxWidth } );
	}

	onChangeTab( tab ) {
		this.setState( { tab: TABS.indexOf( tab ) } );
	}

	renderItem( { item } ) {
		const { itemWidth, maxWidth } = this.state;
		const { onSelect } = this.props;
		return (
			<MenuItem
				item={ item }
				itemWidth={ itemWidth }
				maxWidth={ maxWidth }
				onSelect={ onSelect }
			/>
		);
	}

	renderBlocksTab( listProps ) {
		const { blockItems } = this.props;
		const { numberOfColumns } = this.state;

		return (
			<FlatList
				onLayout={ this.onLayout }
				key={ `InserterUI-Blocks-${ numberOfColumns }` } //re-render when numberOfColumns changes
				keyboardShouldPersistTaps="always"
				numColumns={ numberOfColumns }
				data={ blockItems }
				ItemSeparatorComponent={ () => (
					<TouchableWithoutFeedback accessible={ false }>
						<View style={ styles.rowSeparator } />
					</TouchableWithoutFeedback>
				) }
				keyExtractor={ ( item ) => item.name }
				renderItem={ this.renderItem }
				{ ...listProps }
			/>
		);
	}

	renderReusableBlocksTab( listProps ) {
		const { reusableBlockItems } = this.props;
		const { numberOfColumns } = this.state;

		return (
			<FlatList
				onLayout={ this.onLayout }
				key={ `InserterUI-ReusableBlocks-${ numberOfColumns }` } //re-render when numberOfColumns changes
				keyboardShouldPersistTaps="always"
				numColumns={ numberOfColumns }
				data={ reusableBlockItems }
				ItemSeparatorComponent={ () => (
					<TouchableWithoutFeedback accessible={ false }>
						<View style={ styles.rowSeparator } />
					</TouchableWithoutFeedback>
				) }
				keyExtractor={ ( item ) => item.name }
				renderItem={ this.renderItem }
				{ ...listProps }
			/>
		);
	}

	render() {
		const { reusableBlockItems } = this.props;
		const { numberOfColumns, tab } = this.state;

		const hideHeader = reusableBlockItems.length === 0;

		return (
			<BottomSheet
				isVisible={ true }
				onClose={ this.onClose }
				header={
					<SegmentedControl
						segments={ TABS }
						segmentHandler={ this.onChangeTab }
					/>
				}
				hideHeader={ hideHeader }
				contentStyle={ styles.list }
				isChildrenScrollable
			>
				<TouchableHighlight accessible={ false }>
					<BottomSheetConsumer>
						{ ( { listProps } ) => {
							switch ( tab ) {
								case 0:
									return this.renderBlocksTab( listProps );
								case 1:
									return this.renderReusableBlocksTab(
										listProps
									);
							}
						} }
					</BottomSheetConsumer>
				</TouchableHighlight>
			</BottomSheet>
		);
	}
}

export default compose(
	withSelect( ( select, { clientId, isAppender, rootClientId } ) => {
		const {
			getInserterItems,
			getBlockName,
			getBlockRootClientId,
			getBlockSelectionEnd,
			getSettings,
			canInsertBlockType,
		} = select( 'core/block-editor' );
		const { getChildBlockNames, getBlockType } = select( 'core/blocks' );
		const { getClipboard } = select( 'core/editor' );

		let destinationRootClientId = rootClientId;
		if ( ! destinationRootClientId && ! clientId && ! isAppender ) {
			const end = getBlockSelectionEnd();
			if ( end ) {
				destinationRootClientId =
					getBlockRootClientId( end ) || undefined;
			}
		}
		const destinationRootBlockName = getBlockName(
			destinationRootClientId
		);

		const {
			__experimentalShouldInsertAtTheTop: shouldInsertAtTheTop,
		} = getSettings();
		const clipboard = getClipboard();
		const clipboardBlock =
			clipboard && rawHandler( { HTML: clipboard } )[ 0 ];
		const shouldAddClipboardBlock =
			clipboardBlock &&
			canInsertBlockType( clipboardBlock.name, destinationRootClientId );

		const allItems = getInserterItems( destinationRootClientId );
		const blockItems = allItems.filter(
			( { name } ) => name !== 'core/block'
		);
		const blockItemsWithClipboard = shouldAddClipboardBlock
			? [
					{
						...pick( getBlockType( clipboardBlock.name ), [
							'name',
							'icon',
						] ),
						id: 'clipboard',
						initialAttributes: clipboardBlock.attributes,
						innerBlocks: clipboardBlock.innerBlocks,
					},
					...blockItems,
			  ]
			: blockItems;
		const reusableBlockItems = allItems.filter(
			( { name } ) => name === 'core/block'
		);

		return {
			rootChildBlocks: getChildBlockNames( destinationRootBlockName ),
			blockItems: blockItemsWithClipboard,
			reusableBlockItems,
			destinationRootClientId,
			shouldInsertAtTheTop,
		};
	} ),
	withDispatch( ( dispatch, ownProps, { select } ) => {
		const {
			showInsertionPoint,
			hideInsertionPoint,
			removeBlock,
			resetBlocks,
			clearSelectedBlock,
			insertBlock,
			insertDefaultBlock,
		} = dispatch( 'core/block-editor' );
		const {
			__experimentalFetchReusableBlocks: fetchReusableBlocks,
		} = dispatch( 'core/editor' );

		return {
			fetchReusableBlocks,
			showInsertionPoint() {
				if ( ownProps.shouldReplaceBlock ) {
					const { getBlockOrder, getBlockCount } = select(
						'core/block-editor'
					);

					const count = getBlockCount();
					// Check if there is a rootClientId because that means it is a nested replacable block and we don't want to clear/reset all blocks.
					if ( count === 1 && ! ownProps.rootClientId ) {
						// removing the last block is not possible with `removeBlock` action
						// it always inserts a default block if the last of the blocks have been removed
						clearSelectedBlock();
						resetBlocks( [] );
					} else {
						const blockToReplace = getBlockOrder(
							ownProps.destinationRootClientId
						)[ ownProps.insertionIndex ];

						removeBlock( blockToReplace, false );
					}
				}
				showInsertionPoint(
					ownProps.destinationRootClientId,
					ownProps.insertionIndex
				);
			},
			hideInsertionPoint,
			onSelect( item ) {
				const { name, initialAttributes, innerBlocks } = item;

				const insertedBlock = createBlock(
					name,
					initialAttributes,
					innerBlocks
				);

				insertBlock(
					insertedBlock,
					ownProps.insertionIndex,
					ownProps.destinationRootClientId
				);

				ownProps.onSelect();
			},
			insertDefaultBlock() {
				insertDefaultBlock(
					{},
					ownProps.destinationRootClientId,
					ownProps.insertionIndex
				);
			},
		};
	} ),
	withInstanceId
)( InserterMenu );
