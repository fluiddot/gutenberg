/**
 * External dependencies
 */
import { Text } from 'react-native';

/**
 * Internal dependencies
 */
import styles from '../editor.scss';

/** @typedef {import('@wordpress/element').WPComponent} WPComponent */

/**
 * ReusableBlockEditPanel props.
 *
 * @typedef WPReusableBlockEditPanelProps
 *
 * @property {string}                  title          Title of the reusable
 *                                                    block.
 */

/**
 * Panel for enabling the editing and saving of a reusable block.
 *
 * @param {WPReusableBlockEditPanelProps} props Component props.
 *
 * @return {WPComponent} The panel.
 */
export default function ReusableBlockEditPanel( { title } ) {
	return <Text style={ styles.title }>{ title }</Text>;
}
